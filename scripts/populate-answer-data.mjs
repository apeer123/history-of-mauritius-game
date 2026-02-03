import pg from 'pg';

const connectionString = 'postgres://postgres.zjziegyiscwdpnimjtgm:QlyUGaZrCZehAxeS@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

// MCQ Answer Data - for all MCQ questions
const mcqAnswers = {
  // History Level 1
  "What is the capital of Mauritius?": { options: ["Port Louis", "Curepipe", "Rose Hill", "Vacoas"], correct: 0 },
  "In what year did Mauritius gain independence?": { options: ["1968", "1960", "1975", "1950"], correct: 0 },
  
  // History Level 2
  "What traditional dance is famous in Mauritius?": { options: ["Sega", "Salsa", "Waltz", "Tango"], correct: 0 },
  "Which year saw the arrival of the French in Mauritius?": { options: ["1715", "1638", "1810", "1598"], correct: 0 },
  
  // History Level 3
  "What is the Aapravasi Ghat?": { options: ["Immigration depot", "Colonial mansion", "Sugar factory", "Historic church"], correct: 0 },
  "In what year did the Dutch settle?": { options: ["1638", "1598", "1715", "1810"], correct: 0 },
  
  // Geography Level 1
  "In which ocean is Mauritius located?": { options: ["Indian Ocean", "Atlantic Ocean", "Pacific Ocean", "Arctic Ocean"], correct: 0 },
  
  // Geography Level 2
  "What is the Seven Colored Earth?": { options: ["Natural sand dunes", "Painted rocks", "Coral reef", "Mountain range"], correct: 0 },
  "Where is the Seven Colored Earth located?": { options: ["Chamarel", "Port Louis", "Grand Baie", "Flic en Flac"], correct: 0 },
  
  // Geography Level 3
  "What is the highest mountain?": { options: ["Piton de la Petite Rivière Noire", "Le Morne", "Pieter Both", "Le Pouce"], correct: 0 },
  "Which area has the Central Plateau?": { options: ["Curepipe", "Port Louis", "Grand Baie", "Mahebourg"], correct: 0 },
  
  // Combined Level 1
  "What is unique about the Dodo bird?": { options: ["It was endemic and extinct", "It could fly very high", "It was a predator", "It could swim"], correct: 0 },
  "Mauritius is in the ___ Ocean and gained independence in ___": { options: ["Indian, 1968", "Pacific, 1960", "Atlantic, 1975", "Arctic, 1950"], correct: 0 },
  
  // Combined Level 2
  "Aapravasi Ghat and Le Morne are UNESCO sites": { options: ["True, both are UNESCO sites", "Only Aapravasi Ghat is", "Only Le Morne is", "Neither are UNESCO sites"], correct: 0 },
  "What connects history and geography?": { options: ["Cultural landscape", "Modern technology", "International trade", "Space exploration"], correct: 0 },
  
  // Combined Level 3
  "The Dutch settlement in 1638 shaped geography": { options: ["True - they introduced species", "False - no impact", "They only stayed 1 year", "They never settled"], correct: 0 },
  "UNESCO heritage and island identity": { options: ["Both preserve Mauritian heritage", "Only for tourists", "Not related", "Recent development"], correct: 0 },
};

// Matching pairs data
const matchingAnswers = {
  "Match the historical facts": [
    { left: "Dodo Bird", right: "Extinct animal" },
    { left: "Port Louis", right: "Capital city" },
    { left: "Sugar Cane", right: "Important crop" },
    { left: "Le Morne", right: "UNESCO mountain" }
  ],
  "Match cultural and historical sites": [
    { left: "Aapravasi Ghat", right: "Immigration depot" },
    { left: "Le Morne", right: "Slavery memorial" },
    { left: "Port Louis", right: "Colonial capital" },
    { left: "Chamarel", right: "Natural wonder" }
  ],
  "Match advanced historical facts": [
    { left: "Dutch", right: "1638-1710" },
    { left: "French", right: "1715-1810" },
    { left: "British", right: "1810-1968" },
    { left: "Independence", right: "1968" }
  ],
  "Match geography basics": [
    { left: "Indian Ocean", right: "Mauritius location" },
    { left: "Port Louis", right: "Capital city" },
    { left: "Island", right: "Land type" },
    { left: "Tropical", right: "Climate" }
  ],
  "Match geographic landmarks": [
    { left: "Chamarel", right: "Seven Colored Earth" },
    { left: "Le Morne", right: "Mountain peninsula" },
    { left: "Grand Bassin", right: "Sacred lake" },
    { left: "Pamplemousses", right: "Botanical garden" }
  ],
  "Match advanced geography": [
    { left: "Piton", right: "Highest peak" },
    { left: "Central Plateau", right: "Curepipe area" },
    { left: "Coral reef", right: "Marine feature" },
    { left: "Black River Gorges", right: "National park" }
  ],
  "Match combined facts": [
    { left: "Dodo", right: "Extinct in 1681" },
    { left: "Independence", right: "March 12, 1968" },
    { left: "Capital", right: "Port Louis" },
    { left: "Ocean", right: "Indian" }
  ],
  "Match history and geography": [
    { left: "Colonial ports", right: "Shaped cities" },
    { left: "Sugar estates", right: "Changed landscape" },
    { left: "Immigration", right: "Population diversity" },
    { left: "Mountains", right: "Slave refuges" }
  ],
  "Match complex history-geography": [
    { left: "Dutch impact", right: "Deforestation began" },
    { left: "French era", right: "Port Louis grew" },
    { left: "British rule", right: "Sugar economy" },
    { left: "Modern Mauritius", right: "Tourism focus" }
  ]
};

// Fill in blanks answers
const fillAnswers = {
  "The Dodo bird was found in ___": "Mauritius",
  "Le Morne Brabant is a ___ mountain": "UNESCO",
  "The ___ arrived in 1638": "Dutch",
  "Mauritius is surrounded by the ___ Ocean": "Indian",
  "The Seven Colored Earth is in ___": "Chamarel",
  "The ___ is the main geographic plateau": "Central",
  "___ is the capital in the Indian Ocean": "Port Louis",
  "Sega is a traditional ___ of Mauritius": "dance",
  "Colonial periods shaped ___ and culture": "landscape"
};

// Reorder items - in correct order
const reorderAnswers = {
  "Put in Order": ["Dutch arrive in Mauritius", "French take control", "British rule begins", "Mauritius becomes independent"],
  "Put historical periods in order": ["Arab discovery", "Dutch settlement", "French colonization", "British rule"],
  "Colonial periods in order": ["Portuguese discovery", "Dutch period", "French Isle de France", "British Mauritius"],
  "Geographic hierarchy": ["Island", "Districts", "Villages", "Towns"],
  "Geographic regions": ["Coastal lowlands", "Central plateau", "Mountain peaks", "River valleys"],
  "Landscape types": ["Beaches", "Plains", "Highlands", "Mountains"],
  "Historical timeline": ["Discovery", "Colonization", "Independence", "Republic"],
  "Development timeline": ["Agriculture", "Manufacturing", "Services", "Technology"],
  "Complex timeline": ["Early settlers", "Colonial powers", "Independence movement", "Modern nation"]
};

// True/False answers
const truefalseAnswers = {
  "Mauritius gained independence in 1960": false,
  "Sugar was never important in Mauritius": false,
  "Mauritius was inhabited before European settlement": false,
  "Mauritius is in the Pacific Ocean": false,
  "The Pamplemousses is an ancient temple": false,
  "Mauritius has no mountains": false,
  "Mauritius is a large continent": false,
  "Mauritius has diverse landscapes": true,
  "Island history defines modern Mauritius": true
};

async function populateAnswerData() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('🔌 Connected!\n');

    // Get all questions
    const { rows: questions } = await client.query(`
      SELECT q.id, q.question_text, qt.name as type_name
      FROM questions q
      JOIN question_types qt ON q.question_type_id = qt.id
    `);
    
    console.log(`📋 Found ${questions.length} questions\n`);
    
    let mcqCount = 0, matchCount = 0, fillCount = 0, reorderCount = 0, tfCount = 0;
    
    for (const q of questions) {
      const text = q.question_text;
      
      if (q.type_name === 'mcq') {
        // Check if already has options
        const { rows: existing } = await client.query('SELECT id FROM mcq_options WHERE question_id = $1 LIMIT 1', [q.id]);
        if (existing.length > 0) continue;
        
        // Find matching answer
        const answer = mcqAnswers[text];
        if (answer) {
          for (let i = 0; i < answer.options.length; i++) {
            await client.query(`
              INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
              VALUES ($1, $2, $3, $4)
            `, [q.id, i + 1, answer.options[i], i === answer.correct]);
          }
          mcqCount++;
        }
      } else if (q.type_name === 'matching') {
        const { rows: existing } = await client.query('SELECT id FROM matching_pairs WHERE question_id = $1 LIMIT 1', [q.id]);
        if (existing.length > 0) continue;
        
        const pairs = matchingAnswers[text];
        if (pairs) {
          for (let i = 0; i < pairs.length; i++) {
            await client.query(`
              INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
              VALUES ($1, $2, $3, $4)
            `, [q.id, i + 1, pairs[i].left, pairs[i].right]);
          }
          matchCount++;
        }
      } else if (q.type_name === 'fill') {
        const { rows: existing } = await client.query('SELECT id FROM fill_answers WHERE question_id = $1 LIMIT 1', [q.id]);
        if (existing.length > 0) continue;
        
        const answer = fillAnswers[text];
        if (answer) {
          await client.query(`
            INSERT INTO fill_answers (question_id, answer_text, case_sensitive)
            VALUES ($1, $2, $3)
          `, [q.id, answer, false]);
          fillCount++;
        }
      } else if (q.type_name === 'reorder') {
        const { rows: existing } = await client.query('SELECT id FROM reorder_items WHERE question_id = $1 LIMIT 1', [q.id]);
        if (existing.length > 0) continue;
        
        const items = reorderAnswers[text];
        if (items) {
          for (let i = 0; i < items.length; i++) {
            await client.query(`
              INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
              VALUES ($1, $2, $3, $4)
            `, [q.id, i + 1, items[i], i + 1]);
          }
          reorderCount++;
        }
      } else if (q.type_name === 'truefalse') {
        const { rows: existing } = await client.query('SELECT id FROM truefalse_answers WHERE question_id = $1 LIMIT 1', [q.id]);
        if (existing.length > 0) continue;
        
        const answer = truefalseAnswers[text];
        if (answer !== undefined) {
          await client.query(`
            INSERT INTO truefalse_answers (question_id, correct_answer)
            VALUES ($1, $2)
          `, [q.id, answer]);
          tfCount++;
        }
      }
    }
    
    console.log('✅ Populated answer data:');
    console.log(`   MCQ options: ${mcqCount} questions`);
    console.log(`   Matching pairs: ${matchCount} questions`);
    console.log(`   Fill answers: ${fillCount} questions`);
    console.log(`   Reorder items: ${reorderCount} questions`);
    console.log(`   True/False: ${tfCount} questions`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

populateAnswerData();
