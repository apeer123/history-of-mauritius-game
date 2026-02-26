const { Pool } = require('pg');
const XLSX = require('xlsx');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://mauriitus_game_user:7mNtoGVnBZiQqiNdxc990ZWsY0Dbw1xt@dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com:5432/mauriitus_game?sslmode=require'
});

async function verifyQuestions() {
  const client = await pool.connect();
  
  try {
    console.log('📊 QUESTION DATA VERIFICATION\n');
    
    // Step 1: Get current database state
    console.log('🔍 Current Database State:');
    const dbStats = await client.query(`
      SELECT s.name as subject, qt.name as question_type, COUNT(*) as count 
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      JOIN question_types qt ON q.question_type_id = qt.id
      GROUP BY s.name, qt.name 
      ORDER BY s.name, qt.name
    `);
    
    console.log('Questions by subject and type:');
    dbStats.rows.forEach(row => {
      console.log(`  ${row.subject.padEnd(15)} | ${row.question_type.padEnd(12)} | ${row.count}`);
    });
    
    // Check for combined questions
    const combinedResult = await client.query(
      `SELECT COUNT(*) as count FROM questions q
       JOIN subjects s ON q.subject_id = s.id
       WHERE s.name = 'combined'`
    );
    const combinedCount = combinedResult.rows[0].count;
    console.log(`\n⚠️  Combined subject questions in DB: ${combinedCount}`);
    
    if (combinedCount > 0) {
      const combinedQuestions = await client.query(
        `SELECT q.id, qt.name as question_type, q.question_text as question 
         FROM questions q
         JOIN subjects s ON q.subject_id = s.id
         JOIN question_types qt ON q.question_type_id = qt.id
         WHERE s.name = 'combined' 
         LIMIT 10`
      );
      console.log('\nSample combined questions:');
      combinedQuestions.rows.forEach(q => {
        console.log(`  ID ${q.id}: ${q.question_type.toUpperCase()} - "${q.question?.substring(0, 50)}..."`);
      });
    }
    
    // Step 2: Read Excel file
    console.log('\n📄 Excel File Summary:');
    const excelPath = path.join(__dirname, '../../../Downloads/Questions_PSAC_History and Geography_2018.xlsx');
    const wb = XLSX.readFile(excelPath);
    
    let totalExcelQuestions = 0;
    const excelByType = {};
    const excelBySubject = {};
    
    wb.SheetNames.forEach(sheet => {
      const ws = wb.Sheets[sheet];
      const data = XLSX.utils.sheet_to_json(ws);
      totalExcelQuestions += data.length;
      
      if (!excelByType[sheet]) excelByType[sheet] = 0;
      excelByType[sheet] = data.length;
      
      // Count by subject
      data.forEach(row => {
        const subject = row.subject?.toLowerCase() || 'unknown';
        if (!excelBySubject[subject]) excelBySubject[subject] = 0;
        excelBySubject[subject]++;
      });
    });
    
    console.log('Questions by type in Excel:');
    Object.entries(excelByType).forEach(([type, count]) => {
      console.log(`  ${type.padEnd(15)} | ${count}`);
    });
    
    console.log('\nQuestions by subject in Excel:');
    Object.entries(excelBySubject).forEach(([subject, count]) => {
      console.log(`  ${subject.padEnd(15)} | ${count}`);
    });
    
    console.log(`\nTotal questions in Excel: ${totalExcelQuestions}`);
    
    // Step 3: Compare counts
    console.log('\n📊 Data Comparison:');
    const dbTotal = dbStats.rows.reduce((sum, row) => sum + row.count, 0);
    console.log(`  Database (excluding combined): ${dbTotal - combinedCount}`);
    console.log(`  Excel total: ${totalExcelQuestions}`);
    console.log(`  Difference: ${(dbTotal - combinedCount) - totalExcelQuestions}`);
    
    if (combinedCount > 0) {
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log(`  - Remove ${combinedCount} combined questions from database`);
      console.log(`  - Verify those questions are associated with history or geography`);
    } else {
      console.log('\n✅ No combined questions found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyQuestions();
