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

async function populateQuestionDetails() {
  let client

  try {
    client = await pool.connect()
    console.log('✅ Connected to database\n')

    // Get all questions with their types
    let questions
    try {
      questions = await client.query(`
        SELECT q.id, q.question_text, qt.name as question_type
        FROM questions q
        JOIN question_types qt ON q.question_type_id = qt.id
        ORDER BY q.id
      `)
    } catch (err) {
      console.log('⚠️  Join failed, getting questions without type info:', err.message)
      // Get questions and determine type based on id (as fallback)
      questions = await client.query(`
        SELECT q.id, q.question_text, q.question_type_id
        FROM questions q
        ORDER BY q.id
      `)
      // Map type IDs
      const typeMap = {1: 'mcq', 2: 'matching', 3: 'fill', 4: 'reorder', 5: 'truefalse'}
      questions.rows = questions.rows.map(r => ({
        ...r,
        question_type: typeMap[r.question_type_id] || 'mcq'
      }))
    }

    console.log(`📋 Processing ${questions.rows.length} questions...\n`)

    let mcqCount = 0
    let matchCount = 0
    let fillCount = 0
    let reorderCount = 0
    let tfCount = 0

    for (const q of questions.rows) {
      const type = q.question_type
      const qId = q.id

      if (type === 'mcq') {
        // Add 4 default options (first one is correct)
        const options = [
          { text: 'Option A', correct: true },
          { text: 'Option B', correct: false },
          { text: 'Option C', correct: false },
          { text: 'Option D', correct: false }
        ]

        for (let i = 0; i < options.length; i++) {
          await client.query(
            'INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
            [qId, i + 1, options[i].text, options[i].correct]
          )
        }
        mcqCount++

      } else if (type === 'matching') {
        // Add 3 default matching pairs
        const pairs = [
          { left: 'Item 1', right: 'Match 1' },
          { left: 'Item 2', right: 'Match 2' },
          { left: 'Item 3', right: 'Match 3' }
        ]

        for (let i = 0; i < pairs.length; i++) {
          await client.query(
            'INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
            [qId, i + 1, pairs[i].left, pairs[i].right]
          )
        }
        matchCount++

      } else if (type === 'fill') {
        // Add default answer
        await client.query(
          'INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [qId, 'Mauritius', false]
        )
        fillCount++

      } else if (type === 'reorder') {
        // Add 4 default items
        const items = [
          { text: 'First', position: 1 },
          { text: 'Second', position: 2 },
          { text: 'Third', position: 3 },
          { text: 'Fourth', position: 4 }
        ]

        for (let i = 0; i < items.length; i++) {
          await client.query(
            'INSERT INTO reorder_items (question_id, item_order, item_text, correct_position) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
            [qId, i + 1, items[i].text, items[i].position]
          )
        }
        reorderCount++

      } else if (type === 'truefalse') {
        // Add default answer
        await client.query(
          'INSERT INTO truefalse_answers (question_id, correct_answer, explanation) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [qId, true, 'This is the correct answer']
        )
        tfCount++
      }
    }

    console.log('✅ Populated question details:')
    console.log(`   - MCQ Options: ${mcqCount} questions`)
    console.log(`   - Matching Pairs: ${matchCount} questions`)
    console.log(`   - Fill Answers: ${fillCount} questions`)
    console.log(`   - Reorder Items: ${reorderCount} questions`)
    console.log(`   - T/F Answers: ${tfCount} questions`)

    // Verify
    const mcqOpts = await client.query('SELECT COUNT(*) FROM mcq_options')
    const matches = await client.query('SELECT COUNT(*) FROM matching_pairs')
    const fills = await client.query('SELECT COUNT(*) FROM fill_answers')
    const reorders = await client.query('SELECT COUNT(*) FROM reorder_items')
    const tfs = await client.query('SELECT COUNT(*) FROM truefalse_answers')

    console.log('\n📊 Database verification:')
    console.log(`   ✅ MCQ Options: ${mcqOpts.rows[0].count}`)
    console.log(`   ✅ Matching Pairs: ${matches.rows[0].count}`)
    console.log(`   ✅ Fill Answers: ${fills.rows[0].count}`)
    console.log(`   ✅ Reorder Items: ${reorders.rows[0].count}`)
    console.log(`   ✅ T/F Answers: ${tfs.rows[0].count}`)

    console.log('\n✅ ✅ ✅ COMPLETE!')
    console.log('All questions now have default details and will load!')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    if (client) client.release()
    await pool.end()
  }
}

populateQuestionDetails()
