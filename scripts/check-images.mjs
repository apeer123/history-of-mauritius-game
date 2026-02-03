import pg from 'pg';

const connectionString = 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('Connected to database\n');
    
    const res = await client.query(`
      SELECT id, question_text, image_url 
      FROM questions 
      WHERE image_url IS NOT NULL AND image_url != ''
    `);
    
    console.log(`Found ${res.rows.length} questions with images:\n`);
    
    res.rows.forEach(r => {
      const imgType = r.image_url.startsWith('data:') 
        ? 'BASE64' 
        : r.image_url.includes('supabase') 
          ? 'SUPABASE' 
          : 'EXTERNAL URL';
      console.log(`ID: ${r.id} | Type: ${imgType}`);
      console.log(`   Question: ${r.question_text.substring(0, 50)}...`);
      console.log(`   Image: ${r.image_url.substring(0, 60)}...`);
      console.log('');
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
