const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://mauriitus_game_user:7mNtoGVnBZiQqiNdxc990ZWsY0Dbw1xt@dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com:5432/mauriitus_game?sslmode=require'
});

async function fixCombined() {
  try {
    console.log('🔧 Checking subjects table schema...\n');
    
    // Check subjects table columns
    const columns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'subjects'
      ORDER BY ordinal_position;
    `);
    
    console.log('Subjects table columns:');
    columns.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    // Step 1: Check if combined subject exists
    const existingCombined = await pool.query('SELECT id FROM subjects WHERE LOWER(name) = $1', ['combined']);
    
    let combinedId;
    if (existingCombined.rows.length === 0) {
      console.log('\n📝 Creating "combined" subject...');
      const result = await pool.query(
        'INSERT INTO subjects (name) VALUES ($1) RETURNING id',
        ['combined']
      );
      combinedId = result.rows[0].id;
      console.log(`✅ Created combined subject with ID: ${combinedId}`);
    } else {
      combinedId = existingCombined.rows[0].id;
      console.log(`✅ Combined subject already exists with ID: ${combinedId}`);
    }
    
    // Step 2: Get all history and geography question IDs
    const historyQuestions = await pool.query(
      'SELECT id FROM questions WHERE subject_id = (SELECT id FROM subjects WHERE LOWER(name) = $1) ORDER BY RANDOM()',
      ['history']
    );
    
    const geographyQuestions = await pool.query(
      'SELECT id FROM questions WHERE subject_id = (SELECT id FROM subjects WHERE LOWER(name) = $1) ORDER BY RANDOM()',
      ['geography']
    );
    
    console.log(`\nFound ${historyQuestions.rows.length} history questions`);
    console.log(`Found ${geographyQuestions.rows.length} geography questions`);
    
    // Step 3: Create combined by mixing history and geography
    // Since we have 231 history and 54 geography, let's create a balanced combined set
    // We'll use all 54 geography questions and 54 history questions to keep it balanced (108 total)
    const combinedSize = Math.min(historyQuestions.rows.length, 100); // Take up to 100 history
    const geoSize = Math.min(geographyQuestions.rows.length, 50);     // Take up to 50 geography
    
    const selectedHistory = historyQuestions.rows.slice(0, combinedSize);
    const selectedGeography = geographyQuestions.rows.slice(0, geoSize);
    
    console.log(`\nPlanning to mix:`);
    console.log(`  ${selectedHistory.length} history questions`);
    console.log(`  ${selectedGeography.length} geography questions`);
    console.log(`  Total: ${selectedHistory.length + selectedGeography.length} questions`);
    
    // Step 4: Update selected questions to have combined subject
    if (selectedHistory.length > 0) {
      const historyIds = selectedHistory.map(q => q.id);
      await pool.query(
        'UPDATE questions SET subject_id = $1 WHERE id = ANY($2)',
        [combinedId, historyIds]
      );
      console.log(`\n✅ Updated ${selectedHistory.length} history questions to combined`);
    }
    
    if (selectedGeography.length > 0) {
      const geoIds = selectedGeography.map(q => q.id);
      await pool.query(
        'UPDATE questions SET subject_id = $1 WHERE id = ANY($2)',
        [combinedId, geoIds]
      );
      console.log(`✅ Updated ${selectedGeography.length} geography questions to combined`);
    }
    
    // Step 5: Verify the fix
    const verify = await pool.query(`
      SELECT s.name, COUNT(q.id) as count
      FROM subjects s
      LEFT JOIN questions q ON s.id = q.subject_id
      GROUP BY s.id, s.name
      ORDER BY s.id;
    `);
    
    console.log('\n✨ Final subject distribution:');
    verify.rows.forEach(row => {
      console.log(`  ${row.name}: ${row.count} questions`);
    });
    
    console.log('\n✅ Combined subject fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

fixCombined();
