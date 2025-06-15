const { Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(__dirname, '../certs/ca.crt')).toString()
  }
};

const client = new Client(dbConfig);

const initializeTables = async () => {
  try {
    await client.connect();
    console.log('✅ Connected to Aiven PostgreSQL');

    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        question_text TEXT NOT NULL,
        options JSONB,
        correct_answer JSONB,
        score INTEGER NOT NULL,
        mission_id VARCHAR(50),
        audio_url VARCHAR(255),
        image_url VARCHAR(255),
        targets JSONB
      );

      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        username VARCHAR(100) NOT NULL,
        score INTEGER NOT NULL,
        mission_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50),
        feedback_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tables initialized successfully');
  } catch (err) {
    console.error('❌ Initialization error:', err.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
};

initializeTables();