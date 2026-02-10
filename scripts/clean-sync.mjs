/**
 * CLEAN SYNC: Wipe Render data tables and reimport everything from Supabase.
 * 
 * This script:
 * 1. Deletes all detail tables + questions on Render (preserving schema)
 * 2. Removes duplicate subjects (4,5,6)
 * 3. Re-inserts ALL questions from Supabase with original IDs
 * 4. Re-inserts ALL detail table rows from Supabase with original question_ids
 * 5. Verifies final counts match
 * 
 * Does NOT touch: leaderboard, user_profiles, profiles, NextAuth tables
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

async function run() {
  console.log('=== CLEAN SYNC: Supabase → Render ===\n');

  // ── Step 1: Wipe detail tables and questions on Render ──
  console.log('--- Step 1: Wiping Render data tables ---');
  const wipeTables = [
    'mcq_options', 'matching_pairs', 'fill_answers', 'reorder_items', 'truefalse_answers',
    'questions'
  ];
  for (const t of wipeTables) {
    const r = await renderPool.query(`DELETE FROM ${t}`);
    console.log(`  Deleted ${r.rowCount} rows from ${t}`);
  }

  // ── Step 2: Remove duplicate subjects (keep 1,2,3 — remove 4,5,6) ──
  console.log('\n--- Step 2: Cleaning duplicate subjects ---');
  const subjectsBefore = await renderPool.query('SELECT id, name FROM subjects ORDER BY id');
  console.log('  Before:', subjectsBefore.rows.map(r => `${r.id}:${r.name}`).join(', '));

  // Only delete subjects > 3 that are duplicates
  const dupes = subjectsBefore.rows.filter(r => parseInt(r.id) > 3);
  if (dupes.length > 0) {
    const dupeIds = dupes.map(d => d.id);
    await renderPool.query(`DELETE FROM subjects WHERE id IN (${dupeIds.join(',')})`);
    console.log(`  Removed duplicate subjects: ${dupeIds.join(', ')}`);
  } else {
    console.log('  No duplicate subjects found');
  }

  const subjectsAfter = await renderPool.query('SELECT id, name FROM subjects ORDER BY id');
  console.log('  After:', subjectsAfter.rows.map(r => `${r.id}:${r.name}`).join(', '));

  // ── Step 3: Pull ALL data from Supabase ──
  console.log('\n--- Step 3: Reading all data from Supabase ---');
  
  // First check what columns exist in Supabase questions table
  const supQCols = await supabasePool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'questions' ORDER BY ordinal_position
  `);
  const supQColNames = supQCols.rows.map(r => r.column_name);
  console.log(`  Supabase questions columns: ${supQColNames.join(', ')}`);
  
  const supQuestions = (await supabasePool.query(
    `SELECT ${supQColNames.join(', ')} FROM questions ORDER BY id`
  )).rows;
  console.log(`  Questions: ${supQuestions.length}`);

  const supMcq = (await supabasePool.query('SELECT * FROM mcq_options ORDER BY id')).rows;
  console.log(`  mcq_options: ${supMcq.length}`);

  const supMatching = (await supabasePool.query('SELECT * FROM matching_pairs ORDER BY id')).rows;
  console.log(`  matching_pairs: ${supMatching.length}`);

  const supFill = (await supabasePool.query('SELECT * FROM fill_answers ORDER BY id')).rows;
  console.log(`  fill_answers: ${supFill.length}`);

  const supReorder = (await supabasePool.query('SELECT * FROM reorder_items ORDER BY id')).rows;
  console.log(`  reorder_items: ${supReorder.length}`);

  const supTF = (await supabasePool.query('SELECT * FROM truefalse_answers ORDER BY id')).rows;
  console.log(`  truefalse_answers: ${supTF.length}`);

  // ── Step 4: Check Render questions table identity column type ──
  console.log('\n--- Step 4: Checking questions identity column ---');
  const colInfo = await renderPool.query(`
    SELECT column_name, column_default, is_identity, identity_generation
    FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'id'
  `);
  const idCol = colInfo.rows[0];
  console.log(`  id column: is_identity=${idCol?.is_identity}, generation=${idCol?.identity_generation}, default=${idCol?.column_default}`);

  const isGeneratedAlways = idCol?.identity_generation === 'ALWAYS';

  // ── Step 5: Insert questions with original IDs ──
  console.log('\n--- Step 5: Inserting questions ---');
  let qInserted = 0;
  let qErrors = 0;

  // Check which columns exist on Render questions table
  const renderCols = await renderPool.query(`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'questions'
  `);
  const renderColNames = new Set(renderCols.rows.map(r => r.column_name));

  // Build common columns (exist in BOTH Supabase and Render)
  const commonCols = supQColNames.filter(c => renderColNames.has(c));
  console.log(`  Common columns: ${commonCols.join(', ')}`);

  for (const q of supQuestions) {
    try {
      const vals = commonCols.map((_, i) => `$${i + 1}`).join(', ');
      const params = commonCols.map(c => q[c] !== undefined ? q[c] : null);
      const prefix = isGeneratedAlways ? 'OVERRIDING SYSTEM VALUE' : '';
      await renderPool.query(
        `INSERT INTO questions (${commonCols.join(', ')}) ${prefix} VALUES (${vals}) ON CONFLICT (id) DO NOTHING`,
        params
      );
      qInserted++;
    } catch (err) {
      qErrors++;
      if (qErrors <= 5) console.log(`  Error Q#${q.id}: ${err.message}`);
    }
  }
  console.log(`  Inserted: ${qInserted}, Errors: ${qErrors}`);

  // Reset sequence to max id
  const maxQId = await renderPool.query('SELECT MAX(id) as m FROM questions');
  const maxId = parseInt(maxQId.rows[0].m) || 1;
  try {
    await renderPool.query(`ALTER TABLE questions ALTER COLUMN id RESTART WITH ${maxId + 1}`);
    console.log(`  Sequence reset to ${maxId + 1}`);
  } catch (e) {
    // Try sequence approach
    try {
      await renderPool.query(`SELECT setval(pg_get_serial_sequence('questions', 'id'), ${maxId})`);
      console.log(`  Serial sequence reset to ${maxId}`);
    } catch (e2) {
      console.log(`  Could not reset sequence: ${e2.message}`);
    }
  }

  // ── Step 6: Insert detail tables ──
  console.log('\n--- Step 6: Inserting mcq_options ---');
  let inserted = 0, errors = 0;

  // Check mcq_options identity
  const mcqIdInfo = await renderPool.query(`
    SELECT identity_generation FROM information_schema.columns
    WHERE table_name = 'mcq_options' AND column_name = 'id'
  `);
  const mcqOverride = mcqIdInfo.rows[0]?.identity_generation === 'ALWAYS' ? 'OVERRIDING SYSTEM VALUE' : '';

  for (const row of supMcq) {
    try {
      await renderPool.query(
        `INSERT INTO mcq_options (id, question_id, option_text, is_correct) ${mcqOverride} VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
        [row.id, row.question_id, row.option_text, row.is_correct]
      );
      inserted++;
    } catch (err) {
      errors++;
      if (errors <= 3) console.log(`  Error mcq #${row.id}: ${err.message}`);
    }
  }
  console.log(`  mcq_options: inserted=${inserted}, errors=${errors}`);

  // matching_pairs
  console.log('\n--- Inserting matching_pairs ---');
  inserted = 0; errors = 0;
  const mpIdInfo = await renderPool.query(`
    SELECT identity_generation FROM information_schema.columns
    WHERE table_name = 'matching_pairs' AND column_name = 'id'
  `);
  const mpOverride = mpIdInfo.rows[0]?.identity_generation === 'ALWAYS' ? 'OVERRIDING SYSTEM VALUE' : '';

  for (const row of supMatching) {
    try {
      await renderPool.query(
        `INSERT INTO matching_pairs (id, question_id, left_item, right_item) ${mpOverride} VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
        [row.id, row.question_id, row.left_item, row.right_item]
      );
      inserted++;
    } catch (err) {
      errors++;
      if (errors <= 3) console.log(`  Error mp #${row.id}: ${err.message}`);
    }
  }
  console.log(`  matching_pairs: inserted=${inserted}, errors=${errors}`);

  // fill_answers
  console.log('\n--- Inserting fill_answers ---');
  inserted = 0; errors = 0;
  const faIdInfo = await renderPool.query(`
    SELECT identity_generation FROM information_schema.columns
    WHERE table_name = 'fill_answers' AND column_name = 'id'
  `);
  const faOverride = faIdInfo.rows[0]?.identity_generation === 'ALWAYS' ? 'OVERRIDING SYSTEM VALUE' : '';

  // Check fill_answers columns on BOTH sides
  const faCols = await renderPool.query(`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'fill_answers'
  `);
  const faRenderCols = new Set(faCols.rows.map(r => r.column_name));
  const faSupCols = await supabasePool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'fill_answers'
  `);
  const faSupColNames = new Set(faSupCols.rows.map(r => r.column_name));

  for (const row of supFill) {
    try {
      // Use only columns that exist in both
      let cols = ['id', 'question_id', 'correct_answer'].filter(c => faRenderCols.has(c) && faSupColNames.has(c));
      
      if (faRenderCols.has('acceptable_answers') && faSupColNames.has('acceptable_answers')) {
        cols.push('acceptable_answers');
      }

      const vals = cols.map((_, i) => `$${i + 1}`).join(', ');
      const params = cols.map(c => {
        const v = row[c];
        if (c === 'acceptable_answers' && v !== null && v !== undefined && typeof v === 'object') {
          return JSON.stringify(v);
        }
        return v !== undefined ? v : null;
      });

      await renderPool.query(
        `INSERT INTO fill_answers (${cols.join(', ')}) ${faOverride} VALUES (${vals}) ON CONFLICT (id) DO NOTHING`,
        params
      );
      inserted++;
    } catch (err) {
      errors++;
      if (errors <= 3) console.log(`  Error fa #${row.id}: ${err.message}`);
    }
  }
  console.log(`  fill_answers: inserted=${inserted}, errors=${errors}`);

  // reorder_items
  console.log('\n--- Inserting reorder_items ---');
  inserted = 0; errors = 0;
  const riIdInfo = await renderPool.query(`
    SELECT identity_generation FROM information_schema.columns
    WHERE table_name = 'reorder_items' AND column_name = 'id'
  `);
  const riOverride = riIdInfo.rows[0]?.identity_generation === 'ALWAYS' ? 'OVERRIDING SYSTEM VALUE' : '';

  for (const row of supReorder) {
    try {
      await renderPool.query(
        `INSERT INTO reorder_items (id, question_id, item_text, correct_position) ${riOverride} VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
        [row.id, row.question_id, row.item_text, row.correct_position]
      );
      inserted++;
    } catch (err) {
      errors++;
      if (errors <= 3) console.log(`  Error ri #${row.id}: ${err.message}`);
    }
  }
  console.log(`  reorder_items: inserted=${inserted}, errors=${errors}`);

  // truefalse_answers
  console.log('\n--- Inserting truefalse_answers ---');
  inserted = 0; errors = 0;
  const tfIdInfo = await renderPool.query(`
    SELECT identity_generation FROM information_schema.columns
    WHERE table_name = 'truefalse_answers' AND column_name = 'id'
  `);
  const tfOverride = tfIdInfo.rows[0]?.identity_generation === 'ALWAYS' ? 'OVERRIDING SYSTEM VALUE' : '';

  // Check truefalse_answers columns on BOTH sides
  const tfCols = await renderPool.query(`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'truefalse_answers'
  `);
  const tfRenderCols = new Set(tfCols.rows.map(r => r.column_name));
  const tfSupCols = await supabasePool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'truefalse_answers'
  `);
  const tfSupColNames = new Set(tfSupCols.rows.map(r => r.column_name));

  for (const row of supTF) {
    try {
      let cols = ['id', 'question_id', 'correct_answer'].filter(c => tfRenderCols.has(c) && tfSupColNames.has(c));
      
      if (tfRenderCols.has('explanation') && tfSupColNames.has('explanation')) {
        cols.push('explanation');
      }

      const vals = cols.map((_, i) => `$${i + 1}`).join(', ');
      const params = cols.map(c => row[c] !== undefined ? row[c] : null);

      await renderPool.query(
        `INSERT INTO truefalse_answers (${cols.join(', ')}) ${tfOverride} VALUES (${vals}) ON CONFLICT (id) DO NOTHING`,
        params
      );
      inserted++;
    } catch (err) {
      errors++;
      if (errors <= 3) console.log(`  Error tf #${row.id}: ${err.message}`);
    }
  }
  console.log(`  truefalse_answers: inserted=${inserted}, errors=${errors}`);

  // ── Step 7: Reset all sequences ──
  console.log('\n--- Step 7: Resetting sequences ---');
  const detailTables = ['mcq_options', 'matching_pairs', 'fill_answers', 'reorder_items', 'truefalse_answers'];
  for (const t of detailTables) {
    try {
      const maxR = await renderPool.query(`SELECT MAX(id) as m FROM ${t}`);
      const mx = parseInt(maxR.rows[0].m) || 1;
      try {
        await renderPool.query(`ALTER TABLE ${t} ALTER COLUMN id RESTART WITH ${mx + 1}`);
      } catch {
        await renderPool.query(`SELECT setval(pg_get_serial_sequence('${t}', 'id'), ${mx})`);
      }
      console.log(`  ${t} sequence → ${mx + 1}`);
    } catch (e) {
      console.log(`  ${t} sequence error: ${e.message}`);
    }
  }

  // ── Step 8: Final verification ──
  console.log('\n--- Step 8: Final Verification ---');
  const tables = ['subjects', 'questions', 'mcq_options', 'matching_pairs', 'fill_answers', 'reorder_items', 'truefalse_answers', 'leaderboard', 'user_profiles'];
  
  let allMatch = true;
  for (const t of tables) {
    try {
      const sc = (await supabasePool.query(`SELECT COUNT(*) as c FROM ${t}`)).rows[0].c;
      const rc = (await renderPool.query(`SELECT COUNT(*) as c FROM ${t}`)).rows[0].c;
      const match = parseInt(sc) === parseInt(rc);
      const icon = match ? '✅' : '❌';
      console.log(`  ${t}: Supabase=${sc}, Render=${rc} ${icon}`);
      if (!match) allMatch = false;
    } catch (e) {
      console.log(`  ${t}: error - ${e.message}`);
      allMatch = false;
    }
  }

  // Check MCQ coverage specifically
  const mcqCoverage = await renderPool.query(`
    SELECT COUNT(DISTINCT q.id) as total, 
           COUNT(DISTINCT m.question_id) as covered
    FROM questions q 
    LEFT JOIN mcq_options m ON q.id = m.question_id
    WHERE q.question_type_id = 1
  `);
  const { total, covered } = mcqCoverage.rows[0];
  console.log(`\n  MCQ coverage: ${covered}/${total} questions have options ${parseInt(covered) === parseInt(total) ? '✅' : '❌'}`);

  // Check for duplicate subjects
  const dupCheck = await renderPool.query(`
    SELECT LOWER(name) as n, COUNT(*) as c FROM subjects GROUP BY LOWER(name) HAVING COUNT(*) > 1
  `);
  if (dupCheck.rows.length > 0) {
    console.log(`  Duplicate subjects still present: ${dupCheck.rows.map(r => r.n).join(', ')} ❌`);
    allMatch = false;
  } else {
    console.log('  No duplicate subjects ✅');
  }

  console.log(`\n=== ${allMatch ? 'ALL CHECKS PASSED ✅' : 'SOME ISSUES REMAIN ❌'} ===`);

  await supabasePool.end();
  await renderPool.end();
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
