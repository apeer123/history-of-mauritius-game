import pg from 'pg';

// Direct PostgreSQL connection
const connectionString = 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

async function testInsertAllQuestionTypes() {
  console.log('🧪 Testing Question Insert for All Types');
  console.log('========================================\n');
  
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Get subject, level, and question type IDs
    const { rows: subjects } = await client.query("SELECT id, name FROM subjects");
    const { rows: levels } = await client.query("SELECT id, level_number FROM levels");
    const { rows: types } = await client.query("SELECT id, name FROM question_types");
    
    console.log('📋 Available Subjects:', subjects.map(s => `${s.id}:${s.name}`).join(', '));
    console.log('📋 Available Levels:', levels.map(l => `${l.id}:L${l.level_number}`).join(', '));
    console.log('📋 Available Types:', types.map(t => `${t.id}:${t.name}`).join(', '));
    console.log('');

    const subjectId = subjects[0]?.id;
    const levelId = levels[0]?.id;
    
    if (!subjectId || !levelId) {
      throw new Error('No subjects or levels found in database!');
    }

    // Helper to get or create question type
    const getTypeId = async (typeName) => {
      const existing = types.find(t => t.name === typeName);
      if (existing) return existing.id;
      
      const { rows } = await client.query(
        "INSERT INTO question_types (name) VALUES ($1) RETURNING id",
        [typeName]
      );
      return rows[0].id;
    };

    // ========== TEST 1: MCQ ==========
    console.log('🔵 TEST 1: MCQ Question');
    try {
      const mcqTypeId = await getTypeId('mcq');
      const { rows: [mcqQ] } = await client.query(
        `INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [subjectId, levelId, mcqTypeId, 'TEST MCQ: What is the capital of Mauritius?', 30, 'MES']
      );
      console.log(`   ✅ Question inserted with ID: ${mcqQ.id}`);
      
      // Insert MCQ options
      const mcqOptions = [
        { order: 1, text: 'Port Louis', correct: true },
        { order: 2, text: 'Curepipe', correct: false },
        { order: 3, text: 'Rose Hill', correct: false },
        { order: 4, text: 'Quatre Bornes', correct: false },
      ];
      for (const opt of mcqOptions) {
        await client.query(
          `INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
           VALUES ($1, $2, $3, $4)`,
          [mcqQ.id, opt.order, opt.text, opt.correct]
        );
      }
      console.log('   ✅ MCQ options inserted');
    } catch (err) {
      console.log(`   ❌ MCQ Error: ${err.message}`);
    }

    // ========== TEST 2: MATCHING ==========
    console.log('\n🟢 TEST 2: MATCHING Question');
    try {
      const matchTypeId = await getTypeId('matching');
      const { rows: [matchQ] } = await client.query(
        `INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [subjectId, levelId, matchTypeId, 'TEST MATCHING: Match the cities with their regions', 45, 'MES']
      );
      console.log(`   ✅ Question inserted with ID: ${matchQ.id}`);
      
      const matchPairs = [
        { left: 'Port Louis', right: 'Capital' },
        { left: 'Curepipe', right: 'Plaines Wilhems' },
        { left: 'Grand Baie', right: 'Rivière du Rempart' },
      ];
      for (let i = 0; i < matchPairs.length; i++) {
        await client.query(
          `INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
           VALUES ($1, $2, $3, $4)`,
          [matchQ.id, i + 1, matchPairs[i].left, matchPairs[i].right]
        );
      }
      console.log('   ✅ Matching pairs inserted');
    } catch (err) {
      console.log(`   ❌ MATCHING Error: ${err.message}`);
    }

    // ========== TEST 3: FILL ==========
    console.log('\n🟡 TEST 3: FILL Question');
    try {
      const fillTypeId = await getTypeId('fill');
      const { rows: [fillQ] } = await client.query(
        `INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [subjectId, levelId, fillTypeId, 'TEST FILL: The Dodo bird was native to _____.', 30, 'MES']
      );
      console.log(`   ✅ Question inserted with ID: ${fillQ.id}`);
      
      await client.query(
        `INSERT INTO fill_answers (question_id, answer_text, case_sensitive)
         VALUES ($1, $2, $3)`,
        [fillQ.id, 'Mauritius', false]
      );
      console.log('   ✅ Fill answer inserted');
    } catch (err) {
      console.log(`   ❌ FILL Error: ${err.message}`);
    }

    // ========== TEST 4: REORDER ==========
    console.log('\n🟠 TEST 4: REORDER Question');
    try {
      const reorderTypeId = await getTypeId('reorder');
      const { rows: [reorderQ] } = await client.query(
        `INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [subjectId, levelId, reorderTypeId, 'TEST REORDER: Arrange these events in chronological order', 60, 'MES']
      );
      console.log(`   ✅ Question inserted with ID: ${reorderQ.id}`);
      
      const reorderItems = [
        'Dutch arrived in Mauritius',
        'French took control',
        'British captured Mauritius',
        'Mauritius gained independence',
      ];
      for (let i = 0; i < reorderItems.length; i++) {
        await client.query(
          `INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
           VALUES ($1, $2, $3, $4)`,
          [reorderQ.id, i + 1, reorderItems[i], i + 1]
        );
      }
      console.log('   ✅ Reorder items inserted');
    } catch (err) {
      console.log(`   ❌ REORDER Error: ${err.message}`);
    }

    // ========== TEST 5: TRUEFALSE ==========
    console.log('\n🔴 TEST 5: TRUEFALSE Question');
    try {
      const tfTypeId = await getTypeId('truefalse');
      const { rows: [tfQ] } = await client.query(
        `INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [subjectId, levelId, tfTypeId, 'TEST TRUE/FALSE: The Dodo bird is still alive today.', 20, 'MES']
      );
      console.log(`   ✅ Question inserted with ID: ${tfQ.id}`);
      
      await client.query(
        `INSERT INTO truefalse_answers (question_id, correct_answer, explanation)
         VALUES ($1, $2, $3)`,
        [tfQ.id, false, 'The Dodo bird became extinct in the late 17th century.']
      );
      console.log('   ✅ True/False answer inserted');
    } catch (err) {
      console.log(`   ❌ TRUEFALSE Error: ${err.message}`);
    }

    console.log('\n========================================');
    console.log('🎉 All tests completed!');
    
    // Verify counts
    const { rows: [counts] } = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM questions WHERE question_text LIKE 'TEST %') as test_questions,
        (SELECT COUNT(*) FROM mcq_options) as mcq_options,
        (SELECT COUNT(*) FROM matching_pairs) as matching_pairs,
        (SELECT COUNT(*) FROM fill_answers) as fill_answers,
        (SELECT COUNT(*) FROM reorder_items) as reorder_items,
        (SELECT COUNT(*) FROM truefalse_answers) as truefalse_answers
    `);
    console.log('\n📊 Database Counts:');
    console.log(`   Test Questions: ${counts.test_questions}`);
    console.log(`   MCQ Options: ${counts.mcq_options}`);
    console.log(`   Matching Pairs: ${counts.matching_pairs}`);
    console.log(`   Fill Answers: ${counts.fill_answers}`);
    console.log(`   Reorder Items: ${counts.reorder_items}`);
    console.log(`   True/False Answers: ${counts.truefalse_answers}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database.');
  }
}

testInsertAllQuestionTypes().catch(console.error);
