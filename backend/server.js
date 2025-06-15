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
const port = process.env.PORT || 3001;
const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL 10 minutes

app.set('cache', cache); // Set cache instance to Express app

app.use(cors({ origin: 'http://localhost:3000' })); // Allow frontend access
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
    ca: fs.readFileSync(path.join(__dirname, 'certs', 'ca.crt')).toString(),
  },
};

// Initialize PostgreSQL client
const client = new Client(dbConfig);

// Connect to PostgreSQL
client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => {
    console.error('Failed to connect to PostgreSQL:', err.stack);
    process.exit(1);
  });

// Handle connection events
client.on('error', err => console.error('PostgreSQL connection error:', err.message));
client.on('end', () => console.log('PostgreSQL disconnected'));

// Middleware cache
const cacheMiddleware = (keyPrefix) => (req, res, next) => {
  const cacheKey = `${keyPrefix}-${req.params.missionId || req.query.type || 'all'}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    console.log(`Retrieving from cache: ${cacheKey}`);
    return res.json(cached);
  }

  const originalJson = res.json;
  res.json = function (data) {
    console.log(`Storing in cache: ${cacheKey}`);
    cache.set(cacheKey, data);
    originalJson.call(this, data);
  };
  next();
};

// Initialize app - ini akan dijalankan setelah koneksi DB berhasil
const startApp = async () => {
  try {
    // Mount routes (pass client to routes for database access)
    // Menggunakan questionRoutes dari sub-folder dataRoutes
    app.use('/api/questions', require('./routes/dataRoutes/questionRoutes')(cacheMiddleware, client)); // Endpoint akan dimulai dengan /api/questions
    app.use('/api/leaderboard', require('./routes/leaderboardRoutes')(cacheMiddleware, client));
    app.use('/api/feedback', require('./routes/feedbackRoutes')(client));
    app.use('/api/admin', require('./routes/adminRoutes')(client));
    app.use('/api/users', require('./routes/userRoutes')(client));

    app.listen(port, () => {
      console.log(`NurMath server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error starting app:', err.stack);
    process.exit(1);
  }
};

app.use('/api/progress/:userName', async (req, res) => {
  try {
    const { userName } = req.params;
    const { rows } = await client.query(
      'SELECT DISTINCT mission_id FROM leaderboard WHERE username = $1',
      [userName]
    );
    res.json(rows.map(row => row.mission_id));
  } catch (err) {
    console.error('Error fetching progress:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pastikan koneksi ke DB berhasil sebelum memulai aplikasi
client.on('connect', () => {
  console.log('Database connected, starting application...');
  startApp();
});