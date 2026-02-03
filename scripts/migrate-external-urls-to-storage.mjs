/**
 * Migration script to download external image URLs and upload them to Supabase Storage
 * This ensures all images are stored locally in Supabase for reliability
 */

import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres';
const SUPABASE_URL = 'https://zjziegyiscwdpnimjtgm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqemllZ3lpc2N3ZHBuaW1qdGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTI3MzAsImV4cCI6MjA3OTE4ODczMH0.wfEL2xohbFdVx4u5naem4c54Godw9x2Wk5SA1j0Bowc';

async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

async function uploadToStorage(imageBuffer, questionId, contentType = 'image/jpeg') {
  const filename = `question-${questionId}-${Date.now()}.jpg`;
  const path = `${filename}`;
  
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/question-images/${path}`;
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true'
    },
    body: imageBuffer
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
  }

  // Return the public URL
  return `${SUPABASE_URL}/storage/v1/object/public/question-images/${path}`;
}

function isExternalUrl(url) {
  if (!url) return false;
  if (url.startsWith('data:')) return false;
  if (url.includes('supabase.co/storage')) return false;
  if (url.trim() === '') return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

async function migrate() {
  console.log('🚀 External URLs to Supabase Storage Migration');
  console.log('='.repeat(50));
  console.log('');

  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Find all questions with external image URLs
    const result = await client.query(
      "SELECT id, question_text, image_url FROM questions WHERE image_url IS NOT NULL AND image_url != ''"
    );

    const externalUrls = result.rows.filter(q => isExternalUrl(q.image_url));
    
    console.log(`Found ${externalUrls.length} questions with external image URLs\n`);

    if (externalUrls.length === 0) {
      console.log('✅ No external URLs to migrate!');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const question of externalUrls) {
      console.log(`\n📷 Processing question ID: ${question.id}`);
      console.log(`   Question: ${question.question_text?.substring(0, 40)}...`);
      console.log(`   URL: ${question.image_url.substring(0, 60)}...`);
      
      try {
        // Download the image
        console.log('   ⬇️ Downloading image...');
        const imageBuffer = await downloadImage(question.image_url);
        console.log(`   Downloaded ${(imageBuffer.length / 1024).toFixed(1)}KB`);

        // Upload to Supabase Storage
        console.log('   ⬆️ Uploading to Supabase Storage...');
        const newUrl = await uploadToStorage(imageBuffer, question.id);
        console.log(`   ✅ Uploaded to: ${newUrl.substring(0, 60)}...`);

        // Update the database
        await client.query(
          'UPDATE questions SET image_url = $1 WHERE id = $2',
          [newUrl, question.id]
        );
        console.log('   ✅ Database updated!');
        successCount++;
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database.');
  }
}

migrate();
