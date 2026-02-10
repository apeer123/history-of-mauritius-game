import { Pool } from 'pg'

const pool = new Pool({
  host: 'dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com',
  port: 5432,
  user: 'mauriitus_game_user',
  password: '7mNtoGVnBZiQqiNdxc990ZWsY0Dbw1xt',
  database: 'mauriitus_game',
  ssl: {
    rejectUnauthorized: false
  }
})

async function testQuestionDetails() {
  let client

  try {
    client = await pool.connect()
    console.log('✅ Connected to database\n')

    // Check MCQ options
    console.log('📍 MCQ Options Table')
    const mcqCount = await client.query('SELECT COUNT(*) FROM mcq_options')
    console.log(`   Total MCQ options: ${mcqCount.rows[0].count}`)
    if (mcqCount.rows[0].count === 0) {
      console.log('   ⚠️  MCQ_OPTIONS IS EMPTY!\n')
    } else {
      const sample = await client.query('SELECT * FROM mcq_options LIMIT 3')
      console.log('   Sample options:')
      sample.rows.forEach(opt => {
        console.log(`     Q${opt.question_id}: "${opt.option_text}" (correct: ${opt.is_correct})`)
      })
      console.log()
    }

    // Check Matching Pairs
    console.log('📍 Matching Pairs Table')
    const matchCount = await client.query('SELECT COUNT(*) FROM matching_pairs')
    console.log(`   Total matching pairs: ${matchCount.rows[0].count}`)
    if (matchCount.rows[0].count === 0) {
      console.log('   ⚠️  MATCHING_PAIRS IS EMPTY!\n')
    }

    // Check Fill Answers
    console.log('📍 Fill Answers Table')
    const fillCount = await client.query('SELECT COUNT(*) FROM fill_answers')
    console.log(`   Total fill answers: ${fillCount.rows[0].count}`)
    if (fillCount.rows[0].count === 0) {
      console.log('   ⚠️  FILL_ANSWERS IS EMPTY!\n')
    }

    // Check Reorder Items
    console.log('📍 Reorder Items Table')
    const reorderCount = await client.query('SELECT COUNT(*) FROM reorder_items')
    console.log(`   Total reorder items: ${reorderCount.rows[0].count}`)
    if (reorderCount.rows[0].count === 0) {
      console.log('   ⚠️  REORDER_ITEMS IS EMPTY!\n')
    }

    // Check True/False Answers
    console.log('📍 True/False Answers Table')
    const tfCount = await client.query('SELECT COUNT(*) FROM truefalse_answers')
    console.log(`   Total T/F answers: ${tfCount.rows[0].count}`)
    if (tfCount.rows[0].count === 0) {
      console.log('   ⚠️  TRUEFALSE_ANSWERS IS EMPTY!\n')
    }

    // Summary
    console.log('\n📊 SUMMARY:')
    const questions = await client.query(
      'SELECT question_type, COUNT(*) as count FROM questions JOIN question_types ON question_type_id = question_types.id GROUP BY question_type'
    )
    
    console.log('Questions by type:')
    questions.rows.forEach(q => {
      console.log(`  - ${q.question_type}: ${q.count}`)
    })

    console.log('\n❌ PROBLEM: Question detail tables are empty!')
    console.log('   The API cannot return complete questions without:')
    console.log('   - MCQ options (for multiple choice)')
    console.log('   - Matching pairs (for matching questions)')
    console.log('   - Fill answers (for fill-in-blank)')
    console.log('   - Reorder items (for reorder questions)')
    console.log('   - T/F answers (for true/false)')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    if (client) client.release()
    await pool.end()
  }
}

testQuestionDetails()
