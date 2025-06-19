// ... (import lainnya)
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const compression = require('compression');
const NodeCache = require('node-cache');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL 10 minutes

app.set('cache', cache); // Set cache instance to Express app

app.use(cors({ origin: 'https://nurmath-03backend.vercel.app' })); // Ganti dengan domain produksi saat deploy
app.use(express.json()); // Parse JSON body
app.use(compression()); // Compress HTTP responses
app.use('/public', express.static('public')); // Serve static files from public folder

// PostgreSQL configuration
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

// Log konfigurasi database untuk debugging
console.log('Database Configuration:', {
  user: dbConfig.user,
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  ssl: dbConfig.ssl.ca ? 'Enabled with CA' : 'Disabled'
});

// Initialize PostgreSQL client
const client = new Client(dbConfig);

// Handle connection events with detailed debugging
client.on('connect', () => {
  console.log('✅ Connected to Aiven PostgreSQL');
  console.log('Connection details:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database
  });
});

client.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', {
    message: err.message,
    stack: err.stack,
    code: err.code
  });
});

client.on('end', () => {
  console.log('🔌 PostgreSQL connection closed');
});

// Middleware cache
const cacheMiddleware = (keyPrefix) => (req, res, next) => {
  const cacheKey = `${keyPrefix}-${req.params.missionId || req.query.type || 'all'}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    console.log(`📦 Retrieving from cache: ${cacheKey}`);
    return res.json(cached);
  }

  const originalJson = res.json;
  res.json = function (data) {
    console.log(`💾 Storing in cache: ${cacheKey}`);
    cache.set(cacheKey, data);
    originalJson.call(this, data);
  };
  next();
};

// Route handlers
app.use('/api/questions', require('./routes/dataRoutes/questionRoutes')(cacheMiddleware, client));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes')(cacheMiddleware, client));
app.use('/api/feedback', require('./routes/feedbackRoutes')(client));
app.use('/api/admin', require('./routes/adminRoutes')(client));
app.use('/api/users', require('./routes/userRoutes')(client));

app.use('/api/progress/:userName', async (req, res) => {
  try {
    const { userName } = req.params;
    console.log(`🔍 Fetching progress for user: ${userName}`);
    const { rows } = await client.query(
      'SELECT DISTINCT mission_id FROM leaderboard WHERE username = $1',
      [userName]
    );
    console.log(`✅ Fetched ${rows.length} mission IDs for ${userName}`);
    res.json(rows.map(row => row.mission_id));
  } catch (err) {
    console.error('❌ Error fetching progress:', {
      message: err.message,
      stack: err.stack,
      query: err.query
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ekspor app untuk Vercel
module.exports = app;

// Fungsi untuk inisialisasi koneksi database
const initializeDB = async () => {
  try {
    console.log('🚀 Attempting to connect to Aiven PostgreSQL...');
    await client.connect();
    console.log('✅ Successfully connected to Aiven PostgreSQL');
    console.log('Connection details:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database
    });
  } catch (err) {
    console.error('❌ Failed to connect to Aiven PostgreSQL:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    throw err;
  }
};

// Fungsi untuk seeding data (asumsi seedData diimpor dari seed.js)
const seedData = require('./Scripts/seed');
app.get('/seed', async (req, res) => {
  try {
    console.log('🌱 Starting database seeding process...');
    await seedData();
    console.log('✅ Database seeding completed successfully');
    res.status(200).json({ message: 'Database seeded successfully' });
  } catch (err) {
    console.error('❌ Seeding failed:', {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Seeding failed', details: err.message });
  }
});

// Fungsi untuk inisialisasi tabel (asumsi initializeTables diimpor dari initializeDB.js)
const initializeTables = require('./Scripts/initializeDB');
app.get('/init-db', async (req, res) => {
  try {
    console.log('🛠 Starting database tables initialization...');
    await initializeTables();
    console.log('✅ Database tables initialized successfully');
    res.status(200).json({ message: 'Database tables initialized successfully' });
  } catch (err) {
    console.error('❌ Tables initialization failed:', {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Initialization failed', details: err.message });
  }
});

// Jalankan inisialisasi saat module dimuat (Vercel akan menangani lifecycle)
initializeDB().catch(err => {
  console.error('❌ Initialization failed during module load:', err.stack);
  process.exit(1);
});