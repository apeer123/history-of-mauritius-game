import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  await client.connect();
  
  // Check questions table columns
  console.log('=== QUESTIONS TABLE COLUMNS ===');
  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'questions' 
    ORDER BY ordinal_position
  `);
  console.log(cols.rows);

  // Check a sample MCQ question
  console.log('\n=== SAMPLE MCQ QUESTIONS ===');
  const mcq = await client.query(`SELECT * FROM questions WHERE id IN (1, 2) LIMIT 2`);
  console.log(JSON.stringify(mcq.rows, null, 2));

  // Check mcq_options table
  console.log('\n=== MCQ_OPTIONS TABLE ===');
  const opts = await client.query(`SELECT * FROM mcq_options LIMIT 5`);
  console.log('Count:', opts.rows.length);
  if (opts.rows.length > 0) {
    console.log(JSON.stringify(opts.rows, null, 2));
  }

  await client.end();
}

checkSchema().catch(e => {
  console.error('Error:', e.message);
  client.end();
});
