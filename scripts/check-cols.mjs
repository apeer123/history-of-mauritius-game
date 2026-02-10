import pg from 'pg';
const { Pool } = pg;

const sup = new Pool({
  connectionString: 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000
});
const ren = new Pool({
  host: 'dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com', port: 5432,
  database: 'mauriitus_game', user: 'mauriitus_game_user',
  password: process.env.DB_PASSWORD, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000
});

const tables = ['fill_answers','truefalse_answers','mcq_options','matching_pairs','reorder_items'];

for (const t of tables) {
  const s = await sup.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`, [t]);
  const r = await ren.query(`SELECT column_name FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`, [t]);
  console.log(`${t}:`);
  console.log(`  Supabase: ${s.rows.map(x => x.column_name).join(', ')}`);
  console.log(`  Render:   ${r.rows.map(x => x.column_name).join(', ')}`);
}
await sup.end(); await ren.end();
