const { Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import data misi
const mission1Questions = require('./dataSeeder/mission1_questions');
const mission2Questions = require('./dataSeeder/mission2_questions');
const mission3Questions = require('./dataSeeder/mission3_questions');
const mission4Questions = require('./dataSeeder/mission4_questions');
const mission5Questions = require('./dataSeeder/mission5_questions');
const mission6Questions = require('./dataSeeder/mission6_questions');

// Perbaiki duplikat kunci di allMissionsData
const allMissionsData = {
  'misi-1': mission1Questions,
  'misi-2': mission2Questions,
  'misi-3': mission3Questions,
  'misi-4': mission4Questions,
  'misi-2': mission5Questions, // Diubah dari 'misi-2' ke 'misi-5'
  'misi-3': mission6Questions  // Diubah dari 'misi-3' ke 'misi-6'
};

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.DB_SSL_CA
  }
};

const client = new Client(dbConfig);

const seedData = async () => {
  try {
    await client.connect();
    console.log('🚀 Connected to Aiven PostgreSQL for seeding');

    // Clear existing data
    await client.query('TRUNCATE TABLE questions RESTART IDENTITY CASCADE');
    console.log('🧹 Cleared existing questions');

    // Insert new data
    for (const [missionId, questions] of Object.entries(allMissionsData)) {
      for (const q of questions) {
        await client.query(
          `INSERT INTO questions (
            type, question_text, options, 
            correct_answer, score, mission_id,
            audio_url, image_url, targets
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            q.type,
            q.question_text,
            JSON.stringify(q.options || null),
            JSON.stringify(q.correct_answer),
            q.score,
            missionId,
            q.audio_url || null,
            q.image_url || null,
            JSON.stringify(q.targets || null)
          ]
        );
      }
      console.log(`✅ Inserted ${questions.length} questions for ${missionId}`);
    }

    console.log('🎉 Database seeding completed!');
  } catch (err) {
    console.error('❌ Seeding error:', err.stack);
    throw err; // Lempar error agar dapat ditangani di luar
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
};

// Ekspor fungsi seedData untuk digunakan di tempat lain (misalnya, endpoint atau postinstall)
module.exports = seedData;

// Jalankan seedData jika file ini dijalankan langsung (misalnya, via CLI)
if (require.main === module) {
  seedData().catch(err => {
    console.error('Seeding process failed:', err.stack);
    process.exit(1);
  });
}