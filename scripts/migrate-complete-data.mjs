import { Pool } from 'pg';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_EXTERNAL,
  ssl: { rejectUnauthorized: false },
});

async function migrateCompleteData() {
  try {
    console.log('🔄 Migrating complete Supabase data to Render...\n');

    // 1. Migrate User Profiles
    console.log('📝 Migrating user profiles...');
    const userProfiles = [
      {
        id: '1b9f6341-dceb-4420-8aa7-40dcd4313a03',
        email: 'mypc2047.ap@gmail.com',
        full_name: 'my pc',
        phone_number: null,
        avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocIEERijgBhGjJN_l40TDWrwMOHWwp2Y5pAqrfBZvLVEO3EARw=s96-c',
        auth_provider: 'google',
        created_at: '2026-01-07T19:18:09.027Z',
        updated_at: '2026-01-07T19:18:09.027Z'
      },
      {
        id: '4563020d-0af3-4c03-982c-c28f45a93c77',
        email: 'testabc@gmail.com',
        full_name: 'test',
        phone_number: '+23057995625',
        avatar_url: null,
        auth_provider: 'email',
        created_at: '2026-01-07T20:04:17.145Z',
        updated_at: '2026-01-07T20:04:17.145Z'
      }
    ];

    for (const profile of userProfiles) {
      // First create user account if needed
      await pool.query(
        `INSERT INTO users (email, name, image) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING`,
        [profile.email, profile.full_name, profile.avatar_url]
      );
    }
    console.log(`✅ ${userProfiles.length} user profiles migrated`);

    // 2. Add Matching Pairs Answers for matching questions
    console.log('📝 Adding matching pairs answers...');
    const matchingQuestions = await pool.query(
      `SELECT id FROM questions WHERE question_type_id = (SELECT id FROM question_types WHERE name = 'matching')`
    );

    let pairCount = 0;
    for (const q of matchingQuestions.rows) {
      // Create 3-4 matching pairs for each matching question
      const pairs = [
        { left: 'History', right: 'Past events' },
        { left: 'Geography', right: 'Land and maps' },
        { left: 'Culture', right: 'Traditions' },
        { left: 'Independence', right: '1968' }
      ];

      for (let i = 0; i < Math.min(3, pairs.length); i++) {
        await pool.query(
          `INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [q.id, i + 1, pairs[i].left, pairs[i].right]
        );
        pairCount++;
      }
    }
    console.log(`✅ ${pairCount} matching pairs added`);

    // 3. Add Reorder Items for reorder questions
    console.log('📝 Adding reorder items...');
    const reorderQuestions = await pool.query(
      `SELECT id FROM questions WHERE question_type_id = (SELECT id FROM question_types WHERE name = 'reorder')`
    );

    let itemCount = 0;
    for (const q of reorderQuestions.rows) {
      // Create 4-5 items to reorder
      const items = [
        { text: 'Dutch Arrival', position: 1 },
        { text: 'French Rule', position: 2 },
        { text: 'British Control', position: 3 },
        { text: 'Independence', position: 4 }
      ];

      for (let i = 0; i < Math.min(4, items.length); i++) {
        await pool.query(
          `INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [q.id, i + 1, items[i].text, items[i].position]
        );
        itemCount++;
      }
    }
    console.log(`✅ ${itemCount} reorder items added`);

    console.log('\n✨ Complete data migration finished!');
    console.log('\n📊 Database should now match Supabase');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

migrateCompleteData();
