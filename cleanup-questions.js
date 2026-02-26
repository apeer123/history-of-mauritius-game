const { Pool } = require('pg');
const XLSX = require('xlsx');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://mauriitus_game_user:7mNtoGVnBZiQqiNdxc990ZWsY0Dbw1xt@dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com:5432/mauriitus_game?sslmode=require'
});

async function cleanupQuestions() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 QUESTION CLEANUP & REASSIGNMENT\n');
    
    // Read Excel file
    const excelPath = path.join(__dirname, '../../../Downloads/Questions_PSAC_History and Geography_2018.xlsx');
    const wb = XLSX.readFile(excelPath);
    
    const excelQuestions = [];
    wb.SheetNames.forEach(sheet => {
      const ws = wb.Sheets[sheet];
      const data = XLSX.utils.sheet_to_json(ws);
      data.forEach(row => {
        excelQuestions.push({
          question: (row.question || '').trim()
        });
      });
    });
    
    console.log(`📄 Loaded ${excelQuestions.length} questions from Excel\n`);
    
    // Begin transaction
    await client.query('BEGIN');
    console.log('🔒 Transaction started');
    
    // Get combined questions
    const combinedResult = await client.query(`
      SELECT q.id, q.question_text
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      WHERE s.name = 'combined'
      ORDER BY q.id
    `);
    
    const dbCombined = combinedResult.rows;
    console.log(`\n📊 Processing ${dbCombined.length} combined questions\n`);
    
    let toKeepIds = [];
    let toRemoveIds = [];
    
    // Identify which to keep and which to remove
    dbCombined.forEach(dbQ => {
      const dbQuestionNormalized = (dbQ.question_text || '').trim();
      
      const match = excelQuestions.find(excelQ => {
        const excelQuestionNormalized = excelQ.question.trim();
        return dbQuestionNormalized === excelQuestionNormalized ||
               dbQuestionNormalized.substring(0, 50) === excelQuestionNormalized.substring(0, 50);
      });
      
      if (match) {
        toKeepIds.push(dbQ.id);
      } else {
        toRemoveIds.push(dbQ.id);
      }
    });
    
    console.log(`✅ To reassign to history: ${toKeepIds.length}`);
    console.log(`❌ To remove: ${toRemoveIds.length}\n`);
    
    // Get history subject ID
    const historySubject = await client.query(
      `SELECT id FROM subjects WHERE name = 'history'`
    );
    const historySubjectId = historySubject.rows[0].id;
    
    // Step 1: Delete unmatched combined questions and their related data
    if (toRemoveIds.length > 0) {
      console.log('🗑️  Removing unmatched questions...');
      
      // Delete from dependent tables first
      const idsPlaceholders = toRemoveIds.map((_, i) => `$${i + 1}`).join(',');
      
      await client.query(
        `DELETE FROM mcq_options WHERE question_id IN (${idsPlaceholders})`,
        toRemoveIds
      );
      
      await client.query(
        `DELETE FROM matching_pairs WHERE question_id IN (${idsPlaceholders})`,
        toRemoveIds
      );
      
      await client.query(
        `DELETE FROM reorder_items WHERE question_id IN (${idsPlaceholders})`,
        toRemoveIds
      );
      
      await client.query(
        `DELETE FROM fill_answers WHERE question_id IN (${idsPlaceholders})`,
        toRemoveIds
      );
      
      await client.query(
        `DELETE FROM truefalse_answers WHERE question_id IN (${idsPlaceholders})`,
        toRemoveIds
      );
      
      // Delete questions
      await client.query(
        `DELETE FROM questions WHERE id IN (${idsPlaceholders})`,
        toRemoveIds
      );
      
      console.log(`✅ Deleted ${toRemoveIds.length} unmatched questions and related data`);
    }
    
    // Step 2: Reassign matched combined questions to history
    if (toKeepIds.length > 0) {
      console.log('\n🔄 Reassigning matched questions to history...');
      
      const idsPlaceholders = toKeepIds.map((_, i) => `$${i + 1}`).join(',');
      
      const result = await client.query(
        `UPDATE questions 
         SET subject_id = $${toKeepIds.length + 1}
         WHERE id IN (${idsPlaceholders})`,
        [...toKeepIds, historySubjectId]
      );
      
      console.log(`✅ Reassigned ${result.rowCount} questions to history subject`);
    }
    
    // Verify results
    const verifyResult = await client.query(`
      SELECT s.name as subject, COUNT(*) as count
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      GROUP BY s.name
      ORDER BY s.name
    `);
    
    console.log('\n📊 Updated question distribution:');
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.subject.padEnd(15)} | ${row.count}`);
    });
    
    // Commit
    await client.query('COMMIT');
    console.log('\n✅ Transaction committed successfully');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ CLEANUP COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Results:`);
    console.log(`  • Removed ${toRemoveIds.length} unmatched combined questions`);
    console.log(`  • Reassigned ${toKeepIds.length} matched questions to history`);
    console.log(`  • "Combined" subject is now empty and ready for removal from admin`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupQuestions();
