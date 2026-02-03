import pg from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString = 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

// Tables to export (in order to handle foreign keys)
const tables = [
  'subjects',
  'levels', 
  'question_types',
  'questions',
  'mcq_options',
  'matching_pairs',
  'fill_answers',
  'reorder_items',
  'truefalse_answers',
  'user_profiles',
  'leaderboard'
];

async function exportDatabase() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const backupDir = path.join(process.cwd(), '..', `db_backup_${timestamp}`);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    let allSql = `-- Database backup created at ${new Date().toISOString()}\n`;
    allSql += `-- Run this script to restore the database\n\n`;

    for (const table of tables) {
      console.log(`Exporting ${table}...`);
      
      try {
        // Get table data
        const result = await client.query(`SELECT * FROM ${table}`);
        
        if (result.rows.length === 0) {
          console.log(`  - ${table}: 0 rows (empty)`);
          allSql += `-- Table ${table}: No data\n\n`;
          continue;
        }

        console.log(`  - ${table}: ${result.rows.length} rows`);

        // Generate INSERT statements
        const columns = Object.keys(result.rows[0]);
        allSql += `-- Table: ${table} (${result.rows.length} rows)\n`;
        
        for (const row of result.rows) {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
            if (typeof val === 'number') return val;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            // Escape single quotes
            return `'${String(val).replace(/'/g, "''")}'`;
          });
          allSql += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
        }
        allSql += '\n';

        // Also save as JSON
        const jsonPath = path.join(backupDir, `${table}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(result.rows, null, 2));

      } catch (err) {
        console.log(`  - ${table}: Error - ${err.message}`);
        allSql += `-- Table ${table}: Error exporting - ${err.message}\n\n`;
      }
    }

    // Save combined SQL file
    const sqlPath = path.join(backupDir, 'full_backup.sql');
    fs.writeFileSync(sqlPath, allSql);

    console.log('\n✓ Backup complete!');
    console.log(`  SQL file: ${sqlPath}`);
    console.log(`  JSON files in: ${backupDir}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

exportDatabase();
