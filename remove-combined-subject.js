const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://mauriitus_game_user:7mNtoGVnBZiQqiNdxc990ZWsY0Dbw1xt@dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com:5432/mauriitus_game?sslmode=require'
});

async function removeEmptyCombinedSubject() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 REMOVE EMPTY "COMBINED" SUBJECT\n');
    
    // Begin transaction
    await client.query('BEGIN');
    console.log('🔒 Transaction started');
    
    // Verify no questions are using "combined"
    const checkResult = await client.query(`
      SELECT COUNT(*) as count
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      WHERE s.name = 'combined'
    `);
    
    if (checkResult.rows[0].count > 0) {
      throw new Error('Cannot remove "combined" subject - it still has questions!');
    }
    
    console.log('✅ Verified: No questions using "combined" subject');
    
    // Delete the combined subject
    const deleteResult = await client.query(
      `DELETE FROM subjects WHERE name = 'combined'`
    );
    
    console.log(`✅ Deleted "combined" subject (${deleteResult.rowCount} row)`);
    
    // List remaining subjects
    const listResult = await client.query(`
      SELECT name FROM subjects ORDER BY name
    `);
    
    console.log('\n📋 Remaining subjects:');
    listResult.rows.forEach(row => {
      console.log(`  • ${row.name}`);
    });
    
    // Commit
    await client.query('COMMIT');
    console.log('\n✅ Transaction committed successfully');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ "COMBINED" SUBJECT REMOVED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

removeEmptyCombinedSubject();
