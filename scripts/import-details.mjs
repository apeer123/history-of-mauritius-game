/**
 * Import detail tables from Supabase to Render.
 * Questions (332) and subjects (3) are already correct.
 * Only imports: mcq_options, matching_pairs, fill_answers, reorder_items, truefalse_answers
 * Also: user_profiles, profiles, duplicate subject cleanup
 */
import pg from 'pg';
const { Pool } = pg;

const supabasePool = new Pool({
  connectionString: 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

const renderPool = new Pool({
  host: 'dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com',
  port: 5432,
  database: 'mauriitus_game',
  user: 'mauriitus_game_user',
  password: process.env.DB_PASSWORD || '7mNtoGVnBZiQqiNdxc990ZWsY0Dbw1xt',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

async function getIdentityOverride(pool, table) {
  const r = await pool.query(`
    SELECT identity_generation FROM information_schema.columns
    WHERE table_name = $1 AND column_name = 'id'
  `, [table]);
  return r.rows[0]?.identity_generation === 'ALWAYS' ? 'OVERRIDING SYSTEM VALUE' : '';
}

async function importTable(tableName, columns) {
  console.log(`\n--- Importing ${tableName} ---`);
  
  const override = await getIdentityOverride(renderPool, tableName);
  
  // Check which columns exist on both sides
  const supCols = (await supabasePool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = $1
  `, [tableName])).rows.map(r => r.column_name);
  
  const renCols = (await renderPool.query(`
    SELECT column_name FROM information_schema.columns WHERE table_name = $1
  `, [tableName])).rows.map(r => r.column_name);
  
  // Use requested columns that exist in both
  const useCols = columns.filter(c => supCols.includes(c) && renCols.includes(c));
  console.log(`  Columns: ${useCols.join(', ')}`);
  
  // Fetch from Supabase
  const rows = (await supabasePool.query(`SELECT ${useCols.join(', ')} FROM ${tableName} ORDER BY id`)).rows;
  console.log(`  Supabase rows: ${rows.length}`);
  
  // Clear existing on Render
  const del = await renderPool.query(`DELETE FROM ${tableName}`);
  console.log(`  Cleared ${del.rowCount} existing rows on Render`);
  
  // Insert
  let inserted = 0, errors = 0;
  for (const row of rows) {
    try {
      const vals = useCols.map((_, i) => `$${i + 1}`).join(', ');
      const params = useCols.map(c => row[c] !== undefined ? row[c] : null);
      await renderPool.query(
        `INSERT INTO ${tableName} (${useCols.join(', ')}) ${override} VALUES (${vals}) ON CONFLICT (id) DO NOTHING`,
        params
      );
      inserted++;
    } catch (err) {
      errors++;
      if (errors <= 3) console.log(`  Error #${row.id}: ${err.message}`);
    }
  }
  console.log(`  Inserted: ${inserted}, Errors: ${errors}`);
  
  // Reset sequence
  try {
    const maxR = await renderPool.query(`SELECT MAX(id) as m FROM ${tableName}`);
    const mx = parseInt(maxR.rows[0].m) || 1;
    try {
      await renderPool.query(`ALTER TABLE ${tableName} ALTER COLUMN id RESTART WITH ${mx + 1}`);
    } catch {
      await renderPool.query(`SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), ${mx})`);
    }
  } catch {}
  
  return { inserted, errors, total: rows.length };
}

async function run() {
  console.log('=== DETAIL TABLE IMPORT: Supabase → Render ===');

  // Import all 5 detail tables
  await importTable('mcq_options', ['id', 'question_id', 'option_order', 'option_text', 'is_correct', 'created_at']);
  await importTable('matching_pairs', ['id', 'question_id', 'pair_order', 'left_item', 'right_item', 'created_at']);
  await importTable('fill_answers', ['id', 'question_id', 'answer_text', 'case_sensitive', 'created_at']);
  await importTable('reorder_items', ['id', 'question_id', 'item_order', 'item_text', 'correct_position', 'created_at']);
  await importTable('truefalse_answers', ['id', 'question_id', 'correct_answer', 'explanation', 'created_at']);

  // User profiles
  console.log('\n--- Syncing user_profiles ---');
  const supUP = (await supabasePool.query('SELECT * FROM user_profiles')).rows;
  const renUP = (await renderPool.query('SELECT email FROM user_profiles')).rows;
  const existingEmails = new Set(renUP.map(r => r.email));
  let upInserted = 0;
  for (const u of supUP) {
    if (!existingEmails.has(u.email)) {
      try {
        // Check columns
        const upCols = (await renderPool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'user_profiles'`)).rows.map(r => r.column_name);
        const insertCols = Object.keys(u).filter(k => upCols.includes(k) && k !== 'id');
        const vals = insertCols.map((_, i) => `$${i + 1}`).join(', ');
        const params = insertCols.map(c => u[c] !== undefined ? u[c] : null);
        await renderPool.query(`INSERT INTO user_profiles (${insertCols.join(', ')}) VALUES (${vals})`, params);
        upInserted++;
      } catch (err) {
        console.log(`  Error user_profile ${u.email}: ${err.message}`);
      }
    }
  }
  console.log(`  Supabase: ${supUP.length}, New inserted: ${upInserted}`);

  // Profiles table
  console.log('\n--- Checking profiles table ---');
  const hasProfiles = (await renderPool.query(`
    SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
  `)).rows[0].exists;
  
  if (!hasProfiles) {
    // Get Supabase profiles schema
    const profCols = (await supabasePool.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable 
      FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles'
      ORDER BY ordinal_position
    `)).rows;
    
    if (profCols.length > 0) {
      const colDefs = profCols.map(c => {
        let type = c.data_type;
        if (type === 'character varying' && c.character_maximum_length) type = `VARCHAR(${c.character_maximum_length})`;
        if (type === 'timestamp with time zone') type = 'TIMESTAMPTZ';
        if (type === 'USER-DEFINED') type = 'TEXT';
        const nullable = c.is_nullable === 'NO' ? ' NOT NULL' : '';
        return `${c.column_name} ${type}${nullable}`;
      });
      await renderPool.query(`CREATE TABLE profiles (${colDefs.join(', ')})`);
      console.log('  Created profiles table');
      
      // Import data
      const profData = (await supabasePool.query('SELECT * FROM profiles')).rows;
      console.log(`  Supabase profiles: ${profData.length}`);
      for (const p of profData) {
        try {
          const keys = Object.keys(p);
          const vals = keys.map((_, i) => `$${i + 1}`).join(', ');
          await renderPool.query(`INSERT INTO profiles (${keys.join(', ')}) VALUES (${vals})`, keys.map(k => p[k]));
        } catch (err) {
          console.log(`  Error importing profile: ${err.message}`);
        }
      }
    }
  } else {
    console.log('  Already exists');
  }

  // Final verification
  console.log('\n========================================');
  console.log('FINAL VERIFICATION');
  console.log('========================================');
  const tables = ['subjects', 'questions', 'mcq_options', 'matching_pairs', 'fill_answers', 'reorder_items', 'truefalse_answers', 'leaderboard', 'user_profiles'];
  
  let allMatch = true;
  for (const t of tables) {
    try {
      const sc = (await supabasePool.query(`SELECT COUNT(*) as c FROM ${t}`)).rows[0].c;
      const rc = (await renderPool.query(`SELECT COUNT(*) as c FROM ${t}`)).rows[0].c;
      const match = parseInt(sc) === parseInt(rc);
      console.log(`  ${t}: Supabase=${sc}, Render=${rc} ${match ? '✅' : '❌'}`);
      if (!match) allMatch = false;
    } catch (e) {
      console.log(`  ${t}: error - ${e.message}`);
      allMatch = false;
    }
  }

  // MCQ coverage check
  const mcqCov = await renderPool.query(`
    SELECT COUNT(DISTINCT q.id) as total, COUNT(DISTINCT m.question_id) as covered
    FROM questions q LEFT JOIN mcq_options m ON q.id = m.question_id
    WHERE q.question_type_id = 1
  `);
  const { total, covered } = mcqCov.rows[0];
  console.log(`  MCQ coverage: ${covered}/${total} ${parseInt(covered) === parseInt(total) ? '✅' : '❌'}`);

  console.log(`\n=== ${allMatch ? 'ALL MATCH ✅' : 'ISSUES REMAIN ❌'} ===`);

  await supabasePool.end();
  await renderPool.end();
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
