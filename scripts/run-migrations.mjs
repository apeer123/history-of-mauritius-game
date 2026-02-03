import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Direct PostgreSQL connection - using non-pooling connection for DDL
const connectionString = 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

async function runMigration(client, sqlFile) {
  console.log(`\n📄 Running: ${sqlFile}`);
  
  const sqlPath = path.join(__dirname, sqlFile);
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  try {
    await client.query(sql);
    console.log(`   ✅ ${sqlFile} executed successfully!`);
    return true;
  } catch (err) {
    console.log(`   ❌ Error in ${sqlFile}:`);
    console.log(`      ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Supabase Migration Runner');
  console.log('============================\n');
  
  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');
    
    // Run migrations in order
    await runMigration(client, '10_create_rpc_function.sql');
    
    console.log('\n🎉 Migration complete!');
    
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database.');
  }
}

main().catch(console.error);
