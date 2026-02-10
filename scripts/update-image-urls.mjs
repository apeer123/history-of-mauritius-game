// Script to update question image_url in the Render PostgreSQL database
// Maps downloaded filenames (question-{id}-xxx.jpg) back to their questions
// Usage: node scripts/update-image-urls.mjs

import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Images directory
const IMAGES_DIR = path.join(ROOT, 'public', 'uploads');

// Render PostgreSQL connection
const DATABASE_URL = 'postgresql://mauriitus_game_user:7mNtoGVnBZiQqiNdxc990ZWsY0Dbw1xt@dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com:5432/mauriitus_game?sslmode=require';

const pool = new pg.Pool({ connectionString: DATABASE_URL });

async function main() {
  console.log('=== Update Question Image URLs in Render PostgreSQL ===\n');

  // 1. List downloaded images
  const files = fs.readdirSync(IMAGES_DIR).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
  console.log(`Found ${files.length} image files in ${IMAGES_DIR}\n`);

  // 2. Parse question IDs from filenames
  // Pattern: question-{id}-{timestamp}.{ext}
  const questionImages = new Map(); // questionId -> filename (use latest if multiple)

  for (const file of files) {
    const match = file.match(/^question-(\d+)-(\d+)\./);
    if (match) {
      const questionId = parseInt(match[1]);
      const timestamp = parseInt(match[2]);
      
      // If multiple images for same question, keep the latest
      const existing = questionImages.get(questionId);
      if (!existing || timestamp > existing.timestamp) {
        questionImages.set(questionId, { filename: file, timestamp });
      }
    }
  }

  // Also handle migrated-q{id} pattern
  for (const file of files) {
    const match = file.match(/^migrated-q(\d+)-/);
    if (match) {
      const questionId = parseInt(match[1]);
      if (!questionImages.has(questionId)) {
        questionImages.set(questionId, { filename: file, timestamp: 0 });
      }
    }
  }

  console.log(`Mapped ${questionImages.size} unique question IDs to images:`);
  for (const [id, info] of [...questionImages.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`  Question ${id} → ${info.filename}`);
  }

  // Also list unmapped files (imported-xxx, etc.)
  const unmapped = files.filter(f => !f.match(/^question-\d+/) && !f.match(/^migrated-q\d+/));
  if (unmapped.length > 0) {
    console.log(`\n  ${unmapped.length} unmapped files (imported via Excel, no question ID in name):`);
    unmapped.forEach(f => console.log(`    - ${f}`));
  }

  // 3. Check which question IDs exist in the database
  console.log('\n--- Checking database ---');
  const questionIds = [...questionImages.keys()];
  
  if (questionIds.length === 0) {
    console.log('No question-mapped images found. Nothing to update.');
    await pool.end();
    return;
  }
  
  const existResult = await pool.query(
    `SELECT id, question_text, image_url FROM questions WHERE id = ANY($1) ORDER BY id`,
    [questionIds]
  );
  
  console.log(`${existResult.rows.length} of ${questionIds.length} question IDs exist in Render DB\n`);

  // Show which IDs don't exist (convert to Number to handle pg returning strings)
  const existingIds = new Set(existResult.rows.map(r => Number(r.id)));
  const missingIds = questionIds.filter(id => !existingIds.has(Number(id)));
  if (missingIds.length > 0) {
    console.log(`  ⚠️  Missing from DB (old Supabase IDs): ${missingIds.join(', ')}`);
    console.log(`     These images were for questions that don't exist in Render DB.\n`);
  }

  // 4. Update image_url for questions that exist
  let updated = 0;
  let skipped = 0;

  for (const row of existResult.rows) {
    const imageInfo = questionImages.get(Number(row.id));
    if (!imageInfo) continue;
    
    const newUrl = `/api/images/${imageInfo.filename}`;
    
    if (row.image_url === newUrl) {
      console.log(`  ⏭️  Question ${row.id}: already set to ${newUrl}`);
      skipped++;
      continue;
    }

    await pool.query(
      `UPDATE questions SET image_url = $1 WHERE id = $2`,
      [newUrl, row.id]
    );
    
    const oldUrl = row.image_url || '(none)';
    console.log(`  ✅ Question ${row.id}: ${oldUrl} → ${newUrl}`);
    updated++;
  }

  console.log(`\n=== Complete ===`);
  console.log(`  ✅ Updated: ${updated}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ⚠️  Missing from DB: ${missingIds.length}`);
  console.log(`  🖼️  Unmapped files: ${unmapped.length}`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
