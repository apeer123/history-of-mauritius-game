import pg from 'pg';

const connectionString = 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

async function cleanTestQuestions() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('🔌 Connected!\n');

    // Find test questions
    const { rows: testQuestions } = await client.query(`
      SELECT id, question_text FROM questions 
      WHERE question_text LIKE '%Test%' 
         OR question_text LIKE '%Admin Panel%'
         OR question_text LIKE '%test%'
    `);
    
    console.log('📋 Found test questions:', testQuestions.length);
    testQuestions.forEach(q => console.log(`  - ID ${q.id}: ${q.question_text.substring(0, 50)}...`));
    
    if (testQuestions.length > 0) {
      const ids = testQuestions.map(q => q.id);
      
      // Delete related data first
      await client.query(`DELETE FROM mcq_options WHERE question_id = ANY($1)`, [ids]);
      await client.query(`DELETE FROM matching_pairs WHERE question_id = ANY($1)`, [ids]);
      await client.query(`DELETE FROM fill_answers WHERE question_id = ANY($1)`, [ids]);
      await client.query(`DELETE FROM reorder_items WHERE question_id = ANY($1)`, [ids]);
      await client.query(`DELETE FROM truefalse_answers WHERE question_id = ANY($1)`, [ids]);
      
      // Delete questions
      await client.query(`DELETE FROM questions WHERE id = ANY($1)`, [ids]);
      
      console.log('\n✅ Deleted', testQuestions.length, 'test questions and their related data');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

cleanTestQuestions();
