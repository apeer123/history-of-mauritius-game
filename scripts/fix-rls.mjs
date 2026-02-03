import pg from 'pg';

// Direct PostgreSQL connection
const connectionString = 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

async function runRLSFixes() {
  console.log('🔧 Fixing RLS Policies for Admin Operations');
  console.log('============================================\n');
  
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // First, let's check which tables have RLS enabled
    console.log('📋 Checking RLS status on tables...\n');
    
    const tables = ['subjects', 'levels', 'question_types', 'questions', 'mcq_options', 'matching_pairs', 'fill_answers', 'reorder_items', 'truefalse_answers'];
    
    for (const table of tables) {
      const { rows } = await client.query(`
        SELECT relname, relrowsecurity 
        FROM pg_class 
        WHERE relname = $1
      `, [table]);
      
      if (rows.length > 0) {
        console.log(`  ${table}: RLS ${rows[0].relrowsecurity ? 'ENABLED' : 'DISABLED'}`);
      }
    }
    
    console.log('\n🔓 Disabling RLS on lookup tables (subjects, levels, question_types)...\n');
    
    // Disable RLS on lookup tables - simpler approach
    await client.query('ALTER TABLE subjects DISABLE ROW LEVEL SECURITY');
    console.log('  ✅ subjects: RLS disabled');
    
    await client.query('ALTER TABLE levels DISABLE ROW LEVEL SECURITY');
    console.log('  ✅ levels: RLS disabled');
    
    await client.query('ALTER TABLE question_types DISABLE ROW LEVEL SECURITY');
    console.log('  ✅ question_types: RLS disabled');
    
    console.log('\n🔓 Disabling RLS on question and answer tables...\n');
    
    await client.query('ALTER TABLE questions DISABLE ROW LEVEL SECURITY');
    console.log('  ✅ questions: RLS disabled');
    
    await client.query('ALTER TABLE mcq_options DISABLE ROW LEVEL SECURITY');
    console.log('  ✅ mcq_options: RLS disabled');
    
    await client.query('ALTER TABLE matching_pairs DISABLE ROW LEVEL SECURITY');
    console.log('  ✅ matching_pairs: RLS disabled');
    
    await client.query('ALTER TABLE fill_answers DISABLE ROW LEVEL SECURITY');
    console.log('  ✅ fill_answers: RLS disabled');
    
    await client.query('ALTER TABLE reorder_items DISABLE ROW LEVEL SECURITY');
    console.log('  ✅ reorder_items: RLS disabled');
    
    await client.query('ALTER TABLE truefalse_answers DISABLE ROW LEVEL SECURITY');
    console.log('  ✅ truefalse_answers: RLS disabled');
    
    console.log('\n✅ All RLS policies have been disabled!');
    console.log('📝 Admin panel should now be able to save questions.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database.');
  }
}

runRLSFixes();
