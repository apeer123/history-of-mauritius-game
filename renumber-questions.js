const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://mauriitus_game_user:7mNtoGVnBZiQqiNdxc990ZWsY0Dbw1xt@dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com:5432/mauriitus_game?sslmode=require'
});

async function renumberQuestions() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting question ID renumbering...\n');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Step 1: Get all questions ordered by current ID
    const allQuestions = await client.query('SELECT id FROM questions ORDER BY id');
    const oldIds = allQuestions.rows.map(row => row.id);
    
    console.log(`Found ${oldIds.length} questions`);
    console.log(`Current ID range: ${oldIds[0]} to ${oldIds[oldIds.length - 1]}`);
    
    // Step 2: Drop GENERATED ALWAYS constraint
    console.log('\n🔓 Removing GENERATED ALWAYS constraint from questions.id...');
    await client.query('ALTER TABLE questions ALTER COLUMN id DROP IDENTITY');
    
    // Step 3: Drop foreign key constraints
    console.log('🔓 Dropping foreign key constraints...');
    await client.query('ALTER TABLE mcq_options DROP CONSTRAINT mcq_options_question_id_fkey');
    await client.query('ALTER TABLE matching_pairs DROP CONSTRAINT matching_pairs_question_id_fkey');
    await client.query('ALTER TABLE reorder_items DROP CONSTRAINT reorder_items_question_id_fkey');
    await client.query('ALTER TABLE fill_answers DROP CONSTRAINT fill_answers_question_id_fkey');
    await client.query('ALTER TABLE truefalse_answers DROP CONSTRAINT truefalse_answers_question_id_fkey');
    
    // Step 4: Create mapping table with old->new ID mappings
    console.log('📝 Creating mapping table...');
    await client.query('CREATE TEMP TABLE id_mapping (old_id INT, new_id INT)');
    
    // Insert all mappings
    const tempIdStart = 100000;
    for (let i = 0; i < oldIds.length; i++) {
      const newId = i + 1;
      const oldId = oldIds[i];
      const tempId = tempIdStart + i;
      await client.query(
        'INSERT INTO id_mapping (old_id, new_id) VALUES ($1, $2)',
        [oldId, tempId]
      );
    }
    
    // Step 5a: Update questions using temp mapping (first pass)
    console.log('🔄 Step 5a: Converting questions to temporary IDs...');
    await client.query(`
      UPDATE questions q
      SET id = m.new_id
      FROM id_mapping m
      WHERE q.id = m.old_id
    `);
    
    // Step 5b: Update all dependent tables with temp IDs
    console.log('🔄 Step 5b: Updating dependent tables to temporary IDs...');
    await client.query(`UPDATE mcq_options o SET question_id = m.new_id FROM id_mapping m WHERE o.question_id = m.old_id`);
    await client.query(`UPDATE matching_pairs mp SET question_id = m.new_id FROM id_mapping m WHERE mp.question_id = m.old_id`);
    await client.query(`UPDATE reorder_items ri SET question_id = m.new_id FROM id_mapping m WHERE ri.question_id = m.old_id`);
    await client.query(`UPDATE fill_answers fa SET question_id = m.new_id FROM id_mapping m WHERE fa.question_id = m.old_id`);
    await client.query(`UPDATE truefalse_answers ta SET question_id = m.new_id FROM id_mapping m WHERE ta.question_id = m.old_id`);
    
    // Step 6: Clear mapping and recreate for final IDs
    console.log('📝 Updating mapping table with final IDs...');
    await client.query('DELETE FROM id_mapping');
    
    for (let i = 0; i < oldIds.length; i++) {
      const newId = i + 1;
      const tempId = tempIdStart + i;
      await client.query(
        'INSERT INTO id_mapping (old_id, new_id) VALUES ($1, $2)',
        [tempId, newId]
      );
    }
    
    // Step 7a: Update questions from temp to final IDs
    console.log('🔄 Step 7a: Converting questions to final sequential IDs...');
    await client.query(`
      UPDATE questions q
      SET id = m.new_id
      FROM id_mapping m
      WHERE q.id = m.old_id
    `);
    
    // Step 7b: Update dependent tables to final IDs
    console.log('🔄 Step 7b: Updating dependent tables to final sequential IDs...');
    await client.query(`UPDATE mcq_options o SET question_id = m.new_id FROM id_mapping m WHERE o.question_id = m.old_id`);
    await client.query(`UPDATE matching_pairs mp SET question_id = m.new_id FROM id_mapping m WHERE mp.question_id = m.old_id`);
    await client.query(`UPDATE reorder_items ri SET question_id = m.new_id FROM id_mapping m WHERE ri.question_id = m.old_id`);
    await client.query(`UPDATE fill_answers fa SET question_id = m.new_id FROM id_mapping m WHERE fa.question_id = m.old_id`);
    await client.query(`UPDATE truefalse_answers ta SET question_id = m.new_id FROM id_mapping m WHERE ta.question_id = m.old_id`);
    
    // Step 8: Re-create foreign key constraints
    console.log('🔒 Re-creating foreign key constraints...');
    await client.query('ALTER TABLE mcq_options ADD CONSTRAINT mcq_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE');
    await client.query('ALTER TABLE matching_pairs ADD CONSTRAINT matching_pairs_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE');
    await client.query('ALTER TABLE reorder_items ADD CONSTRAINT reorder_items_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE');
    await client.query('ALTER TABLE fill_answers ADD CONSTRAINT fill_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE');
    await client.query('ALTER TABLE truefalse_answers ADD CONSTRAINT truefalse_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE');
    
    // Step 9: Recreate GENERATED ALWAYS constraint
    console.log('🔢 Recreating GENERATED ALWAYS constraint...');
    const startSeq = allQuestions.rows.length + 1;
    await client.query(`ALTER TABLE questions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (START ${startSeq} INCREMENT 1)`);
    
    // Step 10: Verify
    console.log('\n✅ Verifying renumbering...');
    const verify = await client.query(`
      SELECT 
        COUNT(*) as total_questions,
        MIN(id) as min_id,
        MAX(id) as max_id
      FROM questions
    `);
    
    const result = verify.rows[0];
    console.log(`✨ Final state:`);
    console.log(`  Total questions: ${result.total_questions}`);
    console.log(`  Min ID: ${result.min_id}`);
    console.log(`  Max ID: ${result.max_id}`);
    
    // Check for any gaps
    const gaps = await client.query(`
      SELECT COUNT(*) as gap_count
      FROM (
        SELECT 1
        FROM generate_series(1, $1) AS s(i)
        LEFT JOIN questions ON questions.id = s.i
        WHERE questions.id IS NULL
      ) t
    `, [allQuestions.rows.length]);
    
    if (gaps.rows[0].gap_count === 0) {
      console.log(`  No gaps ✓`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('\n✅ Question ID renumbering complete!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

renumberQuestions();
