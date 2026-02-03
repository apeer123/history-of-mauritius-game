import pg from 'pg';

const connectionString = 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

async function testFullMCQInsert() {
  console.log('🧪 Testing Full MCQ Insert (same as admin panel)');
  console.log('================================================\n');
  
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected!\n');

    // Step 1: Find subject (like admin panel does)
    const { rows: subjects } = await client.query("SELECT id, name FROM subjects");
    const matchedSubject = subjects.find(s => s.name.toLowerCase() === 'history');
    console.log('📋 Found subject:', matchedSubject ? `${matchedSubject.id}:${matchedSubject.name}` : 'NOT FOUND');
    
    // Step 2: Find level
    const { rows: levels } = await client.query("SELECT id, level_number FROM levels");
    const matchedLevel = levels.find(l => l.level_number === 1);
    console.log('📋 Found level:', matchedLevel ? `${matchedLevel.id}:L${matchedLevel.level_number}` : 'NOT FOUND');
    
    // Step 3: Find type
    const { rows: types } = await client.query("SELECT id, name FROM question_types");
    const matchedType = types.find(t => t.name === 'mcq');
    console.log('📋 Found type:', matchedType ? `${matchedType.id}:${matchedType.name}` : 'NOT FOUND');
    
    if (!matchedSubject || !matchedLevel || !matchedType) {
      console.log('\n❌ Missing required data. Cannot proceed.');
      return;
    }

    console.log('\n📝 Inserting MCQ question...');
    
    // Step 4: Insert question
    const { rows: [question] } = await client.query(`
      INSERT INTO questions (question_text, timer_seconds, subject_id, level_id, question_type_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at
    `, ['Admin Panel Test MCQ - ' + new Date().toISOString(), 30, matchedSubject.id, matchedLevel.id, matchedType.id, 'MES']);
    
    console.log('✅ Question inserted with ID:', question.id);
    
    // Step 5: Insert MCQ options
    const options = [
      { letter: 'A', text: 'Option A', isCorrect: true },
      { letter: 'B', text: 'Option B', isCorrect: false },
      { letter: 'C', text: 'Option C', isCorrect: false },
      { letter: 'D', text: 'Option D', isCorrect: false },
    ];
    
    for (let i = 0; i < options.length; i++) {
      await client.query(`
        INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
        VALUES ($1, $2, $3, $4)
      `, [question.id, i + 1, options[i].text, options[i].isCorrect]);
    }
    
    console.log('✅ MCQ options inserted!');
    
    // Verify
    const { rows: verifyOptions } = await client.query('SELECT * FROM mcq_options WHERE question_id = $1', [question.id]);
    console.log('\n📋 Verification - MCQ Options:', verifyOptions.length, 'rows');
    
    console.log('\n🎉 SUCCESS! MCQ question fully saved with ID:', question.id);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testFullMCQInsert();
