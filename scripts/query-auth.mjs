import pg from 'pg';

// Prefer env var if available, else fallback to known connection
const connectionString = process.env.POSTGRES_URL_NON_POOLING || 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    console.log('\n=== Latest auth.users (5) ===');
    const ures = await client.query(`SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;`);
    for (const r of ures.rows) {
      console.log(`- ${r.email} | id=${r.id} | ${r.created_at}`);
    }

    console.log('\n=== Latest public.user_profiles (5) ===');
    const pres = await client.query(`SELECT id, email, full_name, auth_provider, created_at FROM public.user_profiles ORDER BY created_at DESC LIMIT 5;`);
    for (const r of pres.rows) {
      console.log(`- ${r.email} | name=${r.full_name} | provider=${r.auth_provider} | id=${r.id} | ${r.created_at}`);
    }

    if (ures.rows.length && pres.rows.length) {
      const latestUser = ures.rows[0];
      const match = pres.rows.find(p => p.id === latestUser.id);
      console.log('\nProfile trigger check for most recent user:');
      console.log(match ? '✓ Profile exists for latest user' : '✗ No profile found for latest user');
    }
  } finally {
    await client.end();
  }
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
