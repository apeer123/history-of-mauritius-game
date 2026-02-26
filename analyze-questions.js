const { Pool } = require('pg');
const XLSX = require('xlsx');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://mauriitus_game_user:7mNtoGVnBZiQqiNdxc990ZWsY0Dbw1xt@dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com:5432/mauriitus_game?sslmode=require'
});

async function analyzeQuestions() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 DETAILED QUESTION ANALYSIS\n');
    
    // Read Excel file
    const excelPath = path.join(__dirname, '../../../Downloads/Questions_PSAC_History and Geography_2018.xlsx');
    const wb = XLSX.readFile(excelPath);
    
    const excelQuestions = [];
    wb.SheetNames.forEach(sheet => {
      const ws = wb.Sheets[sheet];
      const data = XLSX.utils.sheet_to_json(ws);
      data.forEach(row => {
        excelQuestions.push({
          type: sheet.toLowerCase(),
          subject: (row.subject || '').toLowerCase(),
          question: (row.question || '').trim(),
          level: row.level || 1
        });
      });
    });
    
    console.log(`📄 Loaded ${excelQuestions.length} questions from Excel\n`);
    
    // Get combined questions from database
    const combinedResult = await client.query(`
      SELECT q.id, q.question_text, qt.name as type, l.level_number as level
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      JOIN question_types qt ON q.question_type_id = qt.id
      JOIN levels l ON q.level_id = l.id
      WHERE s.name = 'combined'
      ORDER BY q.id
    `);
    
    const dbCombined = combinedResult.rows;
    console.log(`📊 Found ${dbCombined.length} combined questions in database\n`);
    
    // Try to match database questions with Excel
    let matchedCount = 0;
    let unmatchedCount = 0;
    const unmatchedQuestions = [];
    
    dbCombined.forEach(dbQ => {
      const dbQuestionNormalized = (dbQ.question_text || '').trim();
      
      const match = excelQuestions.find(excelQ => {
        const excelQuestionNormalized = excelQ.question.trim();
        // Try exact match first, then partial match
        return dbQuestionNormalized === excelQuestionNormalized ||
               dbQuestionNormalized.substring(0, 50) === excelQuestionNormalized.substring(0, 50);
      });
      
      if (match) {
        matchedCount++;
      } else {
        unmatchedCount++;
        unmatchedQuestions.push({
          id: dbQ.id,
          type: dbQ.type,
          level: dbQ.level,
          question: dbQ.question_text?.substring(0, 60) + '...'
        });
      }
    });
    
    console.log(`✅ Matched with Excel: ${matchedCount}`);
    console.log(`❌ NOT in Excel: ${unmatchedCount}\n`);
    
    if (unmatchedCount > 0) {
      console.log('Unmatched questions (showing first 10):');
      unmatchedQuestions.slice(0, 10).forEach(q => {
        console.log(`  ID ${q.id}: ${q.type.toUpperCase()} L${q.level} - "${q.question}"`);
      });
      console.log(`  ... and ${unmatchedCount - 10} more\n`);
    }
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Excel questions: ${excelQuestions.length}`);
    console.log(`DB Combined: ${dbCombined.length}`);
    console.log(`DB History: 131 (unverified)`);
    console.log(`DB Geography: 4 (unverified)`);
    console.log(`\nMatched questions: ${matchedCount}/${dbCombined.length}`);
    
    if (unmatchedCount > 0) {
      console.log(`\n⚠️  ACTION NEEDED:`);
      console.log(`   - ${unmatchedCount} combined questions don't match Excel`);
      console.log(`   - These should be reviewed and either:`);
      console.log(`     1. Removed from database`);
      console.log(`     2. Reassigned to history or geography`);
    } else {
      console.log(`\n✅ All combined questions can be mapped to Excel data`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

analyzeQuestions();
