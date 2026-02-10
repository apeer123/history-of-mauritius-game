import pg from 'pg';
const { Pool } = pg;

const supabasePool = new Pool({
  connectionString: 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const renderPool = new Pool({
  host: 'dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com',
  port: 5432,
  database: 'mauriitus_game',
  user: 'mauriitus_game_user',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function syncTable(tableName, hasIdentityId = true) {
  console.log(`\n--- Syncing ${tableName} ---`);
  
  const sRows = (await supabasePool.query(`SELECT * FROM ${tableName} ORDER BY id`)).rows;
  const rRows = (await renderPool.query(`SELECT * FROM ${tableName} ORDER BY id`)).rows;
  
  console.log(`  Supabase: ${sRows.length}, Render: ${rRows.length}`);
  
  if (sRows.length === 0) {
    console.log('  Nothing to sync');
    return 0;
  }

  // Get column names from Supabase
  const sCols = (await supabasePool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`, [tableName]
  )).rows.map(r => r.column_name);
  
  // Get column names from Render
  const rCols = (await renderPool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`, [tableName]
  )).rows.map(r => r.column_name);
  
  // Use only columns that exist in both
  const commonCols = sCols.filter(c => rCols.includes(c));
  const insertCols = hasIdentityId ? commonCols.filter(c => c !== 'id') : commonCols;
  
  console.log(`  Common columns: ${commonCols.join(', ')}`);

  // Get existing IDs on Render (use question_text for questions to handle ID mismatches)
  const existingIds = new Set(rRows.map(r => String(r.id)));
  
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of sRows) {
    if (existingIds.has(String(row.id))) {
      skipped++;
      continue;
    }

    const values = insertCols.map(c => row[c]);
    const placeholders = insertCols.map((_, i) => `$${i + 1}`).join(', ');
    
    try {
      if (!hasIdentityId) {
        // For tables without GENERATED ALWAYS identity, include id
        await renderPool.query(
          `INSERT INTO ${tableName} (${insertCols.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
      } else {
        await renderPool.query(
          `INSERT INTO ${tableName} (${insertCols.join(', ')}) VALUES (${placeholders})`,
          values
        );
      }
      inserted++;
    } catch (e) {
      // Try without id for GENERATED ALWAYS columns
      if (e.message.includes('non-DEFAULT value')) {
        const noidCols = insertCols.filter(c => c !== 'id');
        const noidValues = noidCols.map(c => row[c]);
        const noidPh = noidCols.map((_, i) => `$${i + 1}`).join(', ');
        try {
          await renderPool.query(
            `INSERT INTO ${tableName} (${noidCols.join(', ')}) VALUES (${noidPh})`,
            noidValues
          );
          inserted++;
        } catch (e2) {
          console.log(`  Error row id=${row.id}: ${e2.message.substring(0, 80)}`);
          errors++;
        }
      } else {
        console.log(`  Error row id=${row.id}: ${e.message.substring(0, 80)}`);
        errors++;
      }
    }
  }
  
  console.log(`  Result: inserted=${inserted}, skipped=${skipped}, errors=${errors}`);
  return inserted;
}

try {
  console.log('=== FULL DATA SYNC: Supabase → Render ===');

  // 1. Fix duplicate subjects first - remove IDs 7,8,9 (duplicates of 1,2,3)
  console.log('\n--- Cleaning duplicate subjects ---');
  const dupSubjects = (await renderPool.query(
    `SELECT id, name FROM subjects WHERE id IN (7, 8, 9)`
  )).rows;
  if (dupSubjects.length > 0) {
    // Check if any questions reference these IDs
    const qUsingDups = (await renderPool.query(
      `SELECT COUNT(*) as c FROM questions WHERE subject_id IN (7, 8, 9)`
    )).rows[0].c;
    console.log(`  Duplicate subjects: ${dupSubjects.map(s => `${s.id}:${s.name}`).join(', ')}`);
    console.log(`  Questions using duplicate subject IDs: ${qUsingDups}`);
    
    if (qUsingDups == 0) {
      await renderPool.query(`DELETE FROM subjects WHERE id IN (7, 8, 9)`);
      console.log('  ✅ Removed duplicate subjects (7, 8, 9)');
    } else {
      console.log('  ⚠️ Cannot remove - questions reference them. Updating references...');
      await renderPool.query(`UPDATE questions SET subject_id = 1 WHERE subject_id = 7`);
      await renderPool.query(`UPDATE questions SET subject_id = 2 WHERE subject_id = 8`);
      await renderPool.query(`UPDATE questions SET subject_id = 3 WHERE subject_id = 9`);
      await renderPool.query(`DELETE FROM subjects WHERE id IN (7, 8, 9)`);
      console.log('  ✅ Updated references and removed duplicate subjects');
    }
  }

  // 2. Ensure subjects match (Supabase has IDs 1-6 where 4=History, 5=Geography, 6=Combined)
  console.log('\n--- Syncing subjects ---');
  const sSubjects = (await supabasePool.query('SELECT * FROM subjects ORDER BY id')).rows;
  const rSubjects = (await renderPool.query('SELECT * FROM subjects ORDER BY id')).rows;
  const rSubjectIds = new Set(rSubjects.map(r => String(r.id)));
  
  for (const ss of sSubjects) {
    if (!rSubjectIds.has(String(ss.id))) {
      try {
        // Need to insert with specific ID - use OVERRIDING SYSTEM VALUE if needed
        await renderPool.query(
          `INSERT INTO subjects (id, name, description, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
          [ss.id, ss.name, ss.description, ss.created_at]
        );
        console.log(`  Inserted subject #${ss.id}: ${ss.name}`);
      } catch (e) {
        // Try with OVERRIDING SYSTEM VALUE for GENERATED ALWAYS
        try {
          await renderPool.query(
            `INSERT INTO subjects (id, name, description, created_at) OVERRIDING SYSTEM VALUE VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
            [ss.id, ss.name, ss.description, ss.created_at]
          );
          console.log(`  Inserted subject #${ss.id}: ${ss.name} (with override)`);
        } catch (e2) {
          console.log(`  Could not insert subject #${ss.id}: ${e2.message.substring(0, 60)}`);
        }
      }
    }
  }

  // 3. Sync questions - need to handle ID mapping
  console.log('\n--- Syncing questions ---');
  const sQuestions = (await supabasePool.query('SELECT * FROM questions ORDER BY id')).rows;
  const rQuestions = (await renderPool.query('SELECT * FROM questions ORDER BY id')).rows;
  const rQuestionTexts = new Set(rQuestions.map(r => r.question_text));
  
  // Get Render column names for questions
  const rqCols = (await renderPool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name='questions' ORDER BY ordinal_position`
  )).rows.map(r => r.column_name);
  
  const sqCols = (await supabasePool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name='questions' ORDER BY ordinal_position`
  )).rows.map(r => r.column_name);
  
  const qCommonCols = sqCols.filter(c => rqCols.includes(c) && c !== 'id');
  
  let qInserted = 0;
  let qSkipped = 0;
  const idMap = new Map(); // supabase_id -> render_id
  
  // First, map existing questions by text
  for (const sq of sQuestions) {
    const match = rQuestions.find(r => r.question_text === sq.question_text && 
      String(r.subject_id) === String(sq.subject_id) && 
      String(r.level_id) === String(sq.level_id) &&
      String(r.question_type_id) === String(sq.question_type_id));
    if (match) {
      idMap.set(String(sq.id), String(match.id));
      qSkipped++;
    } else {
      // Insert new question
      const values = qCommonCols.map(c => sq[c]);
      const placeholders = qCommonCols.map((_, i) => `$${i + 1}`).join(', ');
      try {
        const result = await renderPool.query(
          `INSERT INTO questions (${qCommonCols.join(', ')}) VALUES (${placeholders}) RETURNING id`,
          values
        );
        idMap.set(String(sq.id), String(result.rows[0].id));
        qInserted++;
      } catch (e) {
        console.log(`  Error inserting Q#${sq.id}: ${e.message.substring(0, 80)}`);
      }
    }
  }
  console.log(`  Questions: inserted=${qInserted}, matched=${qSkipped}, total mapped=${idMap.size}`);
  
  // 4. Sync detail tables using ID mapping
  const detailTables = ['mcq_options', 'matching_pairs', 'fill_answers', 'reorder_items', 'truefalse_answers'];
  
  for (const dt of detailTables) {
    console.log(`\n--- Syncing ${dt} ---`);
    
    const sDetailCols = (await supabasePool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`, [dt]
    )).rows.map(r => r.column_name);
    
    const rDetailCols = (await renderPool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`, [dt]
    )).rows.map(r => r.column_name);
    
    const dtCommon = sDetailCols.filter(c => rDetailCols.includes(c) && c !== 'id');
    
    const sDetails = (await supabasePool.query(`SELECT * FROM ${dt} ORDER BY id`)).rows;
    console.log(`  Supabase has ${sDetails.length} rows`);
    
    // Clear existing detail data on Render for questions we're syncing
    // Only clear for question IDs that are mapped
    const mappedRenderIds = [...idMap.values()];
    if (mappedRenderIds.length > 0) {
      await renderPool.query(`DELETE FROM ${dt} WHERE question_id = ANY($1::bigint[])`, [mappedRenderIds]);
      console.log(`  Cleared existing ${dt} for mapped questions`);
    }
    
    let dtInserted = 0;
    let dtErrors = 0;
    
    for (const row of sDetails) {
      const renderQid = idMap.get(String(row.question_id));
      if (!renderQid) {
        continue; // Question not mapped
      }
      
      const insertRow = { ...row, question_id: renderQid };
      const values = dtCommon.map(c => insertRow[c]);
      const placeholders = dtCommon.map((_, i) => `$${i + 1}`).join(', ');
      
      try {
        await renderPool.query(
          `INSERT INTO ${dt} (${dtCommon.join(', ')}) VALUES (${placeholders})`,
          values
        );
        dtInserted++;
      } catch (e) {
        if (e.message.includes('non-DEFAULT')) {
          const noidCols = dtCommon.filter(c => c !== 'id');
          const noidValues = noidCols.map(c => insertRow[c]);
          const noidPh = noidCols.map((_, i) => `$${i + 1}`).join(', ');
          try {
            await renderPool.query(`INSERT INTO ${dt} (${noidCols.join(', ')}) VALUES (${noidPh})`, noidValues);
            dtInserted++;
          } catch (e2) {
            dtErrors++;
          }
        } else {
          dtErrors++;
        }
      }
    }
    console.log(`  Inserted: ${dtInserted}, Errors: ${dtErrors}`);
  }

  // 5. Sync user_profiles
  console.log('\n--- Syncing user_profiles ---');
  const sProfiles = (await supabasePool.query('SELECT * FROM user_profiles ORDER BY id')).rows;
  const rProfiles = (await renderPool.query('SELECT * FROM user_profiles ORDER BY id')).rows;
  const rEmails = new Set(rProfiles.map(r => r.email));
  
  const upCols = (await supabasePool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name='user_profiles' ORDER BY ordinal_position`
  )).rows.map(r => r.column_name);
  const rupCols = (await renderPool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name='user_profiles' ORDER BY ordinal_position`
  )).rows.map(r => r.column_name);
  const upCommon = upCols.filter(c => rupCols.includes(c));
  
  let upInserted = 0;
  for (const sp of sProfiles) {
    if (rEmails.has(sp.email)) continue;
    const values = upCommon.map(c => sp[c]);
    const ph = upCommon.map((_, i) => `$${i + 1}`).join(', ');
    try {
      await renderPool.query(`INSERT INTO user_profiles (${upCommon.join(', ')}) VALUES (${ph}) ON CONFLICT DO NOTHING`, values);
      upInserted++;
    } catch (e) {
      console.log(`  Error: ${e.message.substring(0, 80)}`);
    }
  }
  console.log(`  Supabase: ${sProfiles.length}, Render before: ${rProfiles.length}, Inserted: ${upInserted}`);

  // 6. Create profiles table if missing
  console.log('\n--- Checking profiles table ---');
  const hasProfiles = (await renderPool.query(
    `SELECT COUNT(*) as c FROM information_schema.tables WHERE table_name='profiles'`
  )).rows[0].c;
  
  if (hasProfiles == 0) {
    const sProfilesCols = (await supabasePool.query(
      `SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name='profiles' ORDER BY ordinal_position`
    )).rows;
    
    // Create profiles table
    const colDefs = sProfilesCols.map(c => {
      let type = c.data_type;
      if (type === 'character varying' && c.character_maximum_length) type = `VARCHAR(${c.character_maximum_length})`;
      if (type === 'uuid') type = 'UUID';
      if (type === 'timestamp with time zone') type = 'TIMESTAMPTZ';
      return `${c.column_name} ${type}`;
    }).join(', ');
    
    await renderPool.query(`CREATE TABLE IF NOT EXISTS profiles (${colDefs})`);
    console.log('  ✅ Created profiles table');
    
    // Import data
    const sProfilesData = (await supabasePool.query('SELECT * FROM profiles')).rows;
    const pCols = sProfilesCols.map(c => c.column_name);
    let pInserted = 0;
    for (const row of sProfilesData) {
      const vals = pCols.map(c => row[c]);
      const ph = pCols.map((_, i) => `$${i + 1}`).join(', ');
      try {
        await renderPool.query(`INSERT INTO profiles (${pCols.join(', ')}) VALUES (${ph})`, vals);
        pInserted++;
      } catch (e) {
        console.log(`  Error: ${e.message.substring(0, 80)}`);
      }
    }
    console.log(`  Imported ${pInserted}/${sProfilesData.length} profiles`);
  }

  // FINAL COUNTS
  console.log('\n========================================');
  console.log('FINAL VERIFICATION');
  console.log('========================================');
  const tables = ['subjects', 'levels', 'question_types', 'questions', 'mcq_options', 
    'matching_pairs', 'fill_answers', 'reorder_items', 'truefalse_answers', 'leaderboard', 'user_profiles'];
  
  for (const t of tables) {
    const sc = (await supabasePool.query(`SELECT COUNT(*) as c FROM ${t}`)).rows[0].c;
    const rc = (await renderPool.query(`SELECT COUNT(*) as c FROM ${t}`)).rows[0].c;
    const match = sc == rc ? '✅' : '⚠️';
    console.log(`  ${t}: Supabase=${sc}, Render=${rc} ${match}`);
  }

} catch (e) {
  console.error('FATAL:', e.message);
  console.error(e.stack);
} finally {
  await supabasePool.end();
  await renderPool.end();
}
