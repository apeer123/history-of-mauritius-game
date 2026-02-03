import pg from 'pg';

const connectionString = 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

async function checkMissingOptions() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('🔌 Connected!\n');

    // Find MCQ questions missing options
    const { rows: missingMCQ } = await client.query(`
      SELECT q.id, q.question_text 
      FROM questions q 
      LEFT JOIN mcq_options m ON q.id = m.question_id 
      WHERE q.question_type_id = 1 AND m.id IS NULL
    `);
    
    console.log('📋 MCQ questions missing options:', missingMCQ.length);
    missingMCQ.slice(0, 10).forEach(r => console.log(`  - ID ${r.id}: ${r.question_text.substring(0, 50)}...`));
    
    // Find questions with options
    const { rows: withMCQ } = await client.query(`
      SELECT q.id, q.question_text, COUNT(m.id) as opt_count
      FROM questions q 
      LEFT JOIN mcq_options m ON q.id = m.question_id 
      WHERE q.question_type_id = 1
      GROUP BY q.id, q.question_text
      HAVING COUNT(m.id) > 0
    `);
    
    console.log('\n✅ MCQ questions WITH options:', withMCQ.length);
    withMCQ.forEach(r => console.log(`  - ID ${r.id} (${r.opt_count} opts): ${r.question_text.substring(0, 50)}...`));

    // Check all question counts by type
    const { rows: typeCounts } = await client.query(`
      SELECT qt.name, COUNT(q.id) as count
      FROM questions q
      JOIN question_types qt ON q.question_type_id = qt.id
      GROUP BY qt.name
    `);
    console.log('\n📊 Questions by type:');
    typeCounts.forEach(t => console.log(`  - ${t.name}: ${t.count}`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkMissingOptions();
