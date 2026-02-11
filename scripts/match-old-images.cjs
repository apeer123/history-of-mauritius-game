// Match old Supabase images to Render questions by question text
// 1. Connect to Supabase DB (if still alive) to get question text for old IDs
// 2. Find matching question in Render DB by text
// 3. Update image_url in Render DB

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const supabasePool = new Pool({
  connectionString: 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const renderPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Old Supabase IDs -> image files
const oldImages = [
  { supabaseId: 171, file: 'question-171-1769323289270.jpg' },
  { supabaseId: 172, file: 'question-172-1769323291425.jpg' },
  { supabaseId: 173, file: 'question-173-1769323293592.jpg' },
  { supabaseId: 174, file: 'question-174-1769323294901.jpg' },
  { supabaseId: 175, file: 'migrated-q175-1769323024015.jpg' },
  { supabaseId: 176, file: 'migrated-q176-1769323019207.png' },
  { supabaseId: 974, file: 'question-974-1769751329340.jpg' },
];

async function main() {
  console.log('=== Match Old Supabase Images to Render Questions ===\n');

  // 1. Try to get question texts from Supabase
  let supabaseQuestions;
  try {
    console.log('Connecting to Supabase DB...');
    const ids = oldImages.map(o => o.supabaseId);
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const result = await supabasePool.query(
      `SELECT id, question_text FROM questions WHERE id IN (${placeholders}) ORDER BY id`,
      ids
    );
    supabaseQuestions = result.rows;
    console.log(`Found ${supabaseQuestions.length} questions in Supabase DB\n`);
  } catch (err) {
    console.log(`Cannot connect to Supabase DB: ${err.message}`);
    console.log('Supabase may have been shut down. Cannot auto-match.\n');
    await supabasePool.end();
    await renderPool.end();
    return;
  }

  // 2. For each Supabase question, find matching text in Render DB
  let updated = 0;
  let notFound = 0;

  for (const img of oldImages) {
    const supaQ = supabaseQuestions.find(q => Number(q.id) === img.supabaseId);
    if (!supaQ) {
      console.log(`⚠️  Supabase ID ${img.supabaseId}: NOT found in Supabase DB either`);
      notFound++;
      continue;
    }

    console.log(`Supabase ID ${img.supabaseId}: "${supaQ.question_text.substring(0, 80)}..."`);

    // Find by exact text match in Render
    const renderMatch = await renderPool.query(
      `SELECT id, question_text, image_url FROM questions WHERE question_text = $1`,
      [supaQ.question_text]
    );

    if (renderMatch.rows.length === 0) {
      // Try fuzzy match (first 50 chars)
      const fuzzy = await renderPool.query(
        `SELECT id, question_text, image_url FROM questions WHERE question_text LIKE $1`,
        [supaQ.question_text.substring(0, 50) + '%']
      );
      if (fuzzy.rows.length === 0) {
        console.log(`  ❌ No match found in Render DB\n`);
        notFound++;
        continue;
      }
      console.log(`  📎 Fuzzy match → Render ID ${fuzzy.rows[0].id}`);
      const renderId = fuzzy.rows[0].id;
      const currentUrl = fuzzy.rows[0].image_url;
      const newUrl = `/uploads/${img.file}`;

      if (currentUrl) {
        console.log(`  ⏭️  Already has image_url: ${currentUrl} — skipping\n`);
        continue;
      }

      await renderPool.query(`UPDATE questions SET image_url = $1 WHERE id = $2`, [newUrl, renderId]);
      console.log(`  ✅ Set image_url → ${newUrl}\n`);
      updated++;
    } else {
      const renderId = renderMatch.rows[0].id;
      const currentUrl = renderMatch.rows[0].image_url;
      const newUrl = `/uploads/${img.file}`;

      console.log(`  📎 Exact match → Render ID ${renderId}`);

      if (currentUrl) {
        console.log(`  ⏭️  Already has image_url: ${currentUrl} — skipping\n`);
        continue;
      }

      await renderPool.query(`UPDATE questions SET image_url = $1 WHERE id = $2`, [newUrl, renderId]);
      console.log(`  ✅ Set image_url → ${newUrl}\n`);
      updated++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`  ✅ Linked: ${updated}`);
  console.log(`  ❌ Not found: ${notFound}`);

  await supabasePool.end();
  await renderPool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
