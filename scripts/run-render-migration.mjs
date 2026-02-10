import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Render Database Credentials
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

async function runMigration() {
  let client

  try {
    client = await pool.connect()
    console.log('✅ Connected to Render PostgreSQL')

    // Run 01_create_schema.sql
    console.log('\n📋 Running 01_create_schema.sql...')
    const schema = readFileSync(join(__dirname, '01_create_schema.sql'), 'utf8')
    await client.query(schema)
    console.log('✅ Schema created successfully')

    // Run 02_insert_all_questions.sql
    console.log('\n📋 Running 02_insert_all_questions.sql...')
    const questions = readFileSync(join(__dirname, '02_insert_all_questions.sql'), 'utf8')
    await client.query(questions)
    console.log('✅ Questions inserted successfully')

    // Run 08_insert_question_options.sql if it exists
    console.log('\n📋 Running 08_insert_question_options.sql...')
    const options = readFileSync(join(__dirname, '08_insert_question_options.sql'), 'utf8')
    await client.query(options)
    console.log('✅ Question options inserted successfully')

    console.log('\n✅ All migrations completed successfully!')

    // Verify data
    const result = await client.query('SELECT COUNT(*) FROM questions')
    console.log(`\n📊 Database now contains ${result.rows[0].count} questions`)

  } catch (error) {
    console.error('❌ Migration error:', error.message)
    process.exit(1)
  } finally {
    if (client) client.release()
    await pool.end()
  }
}

runMigration()
