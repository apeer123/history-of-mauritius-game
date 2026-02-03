import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

async function main() {
  console.log('🚀 Running Storage Bucket Migration');
  console.log('====================================\n');
  
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');
    
    const sqlPath = path.join(__dirname, '12_create_storage_bucket.sql');
    console.log('📄 Reading SQL file:', sqlPath);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🔧 Executing storage bucket creation...');
    await client.query(sql);
    console.log('✅ Storage bucket created successfully!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database.');
  }
}

main().catch(console.error);
