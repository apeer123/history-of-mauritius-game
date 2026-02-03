import pg from 'pg';
import https from 'https';
import http from 'http';

const connectionString = 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres';
const SUPABASE_URL = 'https://zjziegyiscwdpnimjtgm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqemllZ3lpc2N3ZHBuaW1qdGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTI3MzAsImV4cCI6MjA3OTE4ODczMH0.wfEL2xohbFdVx4u5naem4c54Godw9x2Wk5SA1j0Bowc';

const BUCKET_NAME = 'question-images';

async function uploadToSupabase(base64Data, questionId) {
  // Extract the mime type and base64 content
  const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 format');
  }
  
  const mimeType = matches[1];
  const base64Content = matches[2];
  const buffer = Buffer.from(base64Content, 'base64');
  
  // Determine file extension
  const extMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  };
  const ext = extMap[mimeType] || 'jpg';
  
  const fileName = `migrated-q${questionId}-${Date.now()}.${ext}`;
  
  // Upload to Supabase Storage
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${fileName}`;
  
  return new Promise((resolve, reject) => {
    const url = new URL(uploadUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': mimeType,
        'Content-Length': buffer.length,
        'x-upsert': 'true'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
          resolve(publicUrl);
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

async function main() {
  console.log('🚀 Base64 to Supabase Storage Migration');
  console.log('========================================\n');
  
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Find all base64 images
    const res = await client.query(`
      SELECT id, question_text, image_url 
      FROM questions 
      WHERE image_url LIKE 'data:%'
    `);
    
    console.log(`Found ${res.rows.length} questions with base64 images\n`);
    
    if (res.rows.length === 0) {
      console.log('No base64 images to migrate!');
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const row of res.rows) {
      console.log(`\n📷 Processing question ID: ${row.id}`);
      console.log(`   Question: ${row.question_text.substring(0, 40)}...`);
      
      try {
        // Upload to Supabase Storage
        const newUrl = await uploadToSupabase(row.image_url, row.id);
        console.log(`   ✅ Uploaded to: ${newUrl.substring(0, 60)}...`);
        
        // Update the database
        await client.query(
          'UPDATE questions SET image_url = $1 WHERE id = $2',
          [newUrl, row.id]
        );
        console.log(`   ✅ Database updated!`);
        successCount++;
        
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
        failCount++;
      }
    }
    
    console.log('\n========================================');
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database.');
  }
}

main();
