const { Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Pastikan .env dimuat dari root proyek
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import data misi
const mission1Questions = require('./data/mission1_questions');
const mission2Questions = require('./data/mission2_questions');
const mission3Questions = require('./data/mission3_questions');
const mission4Questions = require('./data/mission4_questions'); 
const mission5Questions = require('./data/mission5_questions'); 
const mission6Questions = require('./data/mission6_questions'); 

const allMissionsData = {
  'misi-1': mission1Questions,
  'misi-2': mission2Questions,
  'misi-3': mission3Questions,
  'misi-4': mission4Questions,
  'misi-5': mission5Questions, 
  'misi-6': mission6Questions, 
};

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(__dirname, '../backend/certs', 'ca.crt')).toString(), // Perhatikan path ke certs
  },
};

const client = new Client(dbConfig);

const seedData = async () => {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL for seeding.');

    const missions = ['misi-1', 'misi-2', 'misi-3'];
    for (const missionId of missions) {
      const { rows } = await client.query('SELECT COUNT(*) as count FROM questions WHERE mission_id = $1', [missionId]);
      const count = parseInt(rows[0].count);

      if (count === 0) {
        const questions = allMissionsData[missionId].map(q => ({ ...q, mission_id: missionId }));

        for (const q of questions) {
          await client.query(
            `
              INSERT INTO questions (type, question_text, options, correct_answer, score, mission_id, audio_url, image_url, targets)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `,
            [
              q.type,
              q.question_text,
              JSON.stringify(q.options || q.statements || null),
              JSON.stringify(q.correct_answer),
              q.score,
              q.mission_id,
              q.audio_url || null,
              q.image_url || null,
              JSON.stringify(q.targets || null),
            ]
          );
        }
        console.log(`Seeded ${questions.length} questions for ${missionId}`);
      } else {
        console.log(`Found ${count} questions for ${missionId}, skipping seeding.`);
      }
    }
    console.log('All seeding processes completed.');
  } catch (err) {
    console.error('Error during seeding:', err.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('PostgreSQL connection closed.');
  }
};

seedData();