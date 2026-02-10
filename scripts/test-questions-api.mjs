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

async function testQuestionsAPI() {
  let client

  try {
    client = await pool.connect()
    console.log('✅ Connected to database\n')

    // Test 1: Check raw questions
    console.log('📍 Test 1: Raw questions count')
    const rawCount = await client.query('SELECT COUNT(*) FROM questions')
    console.log(`   Total questions: ${rawCount.rows[0].count}\n`)

    // Test 2: Check column names
    console.log('📍 Test 2: Questions table columns')
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'questions'
      ORDER BY ordinal_position
    `)
    console.log('   Columns:')
    columns.rows.forEach(col => {
      console.log(`     - ${col.column_name}: ${col.data_type}`)
    })
    console.log()

    // Test 3: Run the exact API query
    console.log('📍 Test 3: API Query (History Level 1)')
    const apiQuery = `
      SELECT 
        q.id, q.question_text, q.timer_seconds,
        s.name as subject, l.level_number as level, qt.name as question_type
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      JOIN levels l ON q.level_id = l.id
      JOIN question_types qt ON q.question_type_id = qt.id
      WHERE s.name = $1 AND l.level_number = $2
      ORDER BY q.id
    `
    
    const result = await client.query(apiQuery, ['history', 1])
    console.log(`   Found: ${result.rows.length} questions`)
    if (result.rows.length > 0) {
      console.log('   Sample:')
      console.log(`     ID: ${result.rows[0].id}`)
      console.log(`     Text: ${result.rows[0].question_text}`)
      console.log(`     Subject: ${result.rows[0].subject}`)
      console.log(`     Level: ${result.rows[0].level}`)
      console.log(`     Type: ${result.rows[0].question_type}`)
    }
    console.log()

    // Test 4: Check subject names
    console.log('📍 Test 4: Available subjects')
    const subjects = await client.query('SELECT id, name FROM subjects ORDER BY name')
    subjects.rows.forEach(s => {
      console.log(`     - ${s.name} (id: ${s.id})`)
    })
    console.log()

    // Test 5: Check if there are any questions with subject_id=1
    console.log('📍 Test 5: Questions by subject')
    const bySubject = await client.query(`
      SELECT subject_id, COUNT(*) as count 
      FROM questions 
      GROUP BY subject_id 
      ORDER BY subject_id
    `)
    bySubject.rows.forEach(row => {
      console.log(`     Subject ID ${row.subject_id}: ${row.count} questions`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
  } finally {
    if (client) client.release()
    await pool.end()
  }
}

testQuestionsAPI()
