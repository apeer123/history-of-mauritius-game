const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://mauriitus_game_user:7mNtoGVnBZiQqiNdxc990ZWsY0Dbw1xt@dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com:5432/mauriitus_game?sslmode=require'
});

async function checkCombined() {
  try {
    console.log('Checking subjects and their question counts...\n');
    
    // First check the subjects table
    const subjects = await pool.query('SELECT id, name FROM subjects ORDER BY id;');
    console.log('Subjects in database:');
    subjects.rows.forEach(row => {
      console.log(`  ID ${row.id}: ${row.name}`);
    });
    
    // Now count questions by subject
    const counts = await pool.query(`
      SELECT s.name, COUNT(q.id) as count
      FROM subjects s
      LEFT JOIN questions q ON s.id = q.subject_id
      GROUP BY s.id, s.name
      ORDER BY s.id;
    `);
    
    console.log('\nQuestions per subject:');
    counts.rows.forEach(row => {
      console.log(`  ${row.name}: ${row.count} questions`);
    });
    
    // Check specifically for combined
    const combined = counts.rows.find(r => r.name.toLowerCase() === 'combined');
    if (!combined || combined.count === 0) {
      console.log('\n⚠️  PROBLEM: "Combined" has 0 questions!');
      console.log('This explains why users only see Geography questions.');
      
      // Count history and geography
      const hist = counts.rows.find(r => r.name.toLowerCase() === 'history');
      const geo = counts.rows.find(r => r.name.toLowerCase() === 'geography');
      
      console.log(`\nAvailable to mix:`);
      console.log(`  History: ${hist?.count || 0} questions`);
      console.log(`  Geography: ${geo?.count || 0} questions`);
      console.log(`  Total available: ${(hist?.count || 0) + (geo?.count || 0)} questions`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

checkCombined();
