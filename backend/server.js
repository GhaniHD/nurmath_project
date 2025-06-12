const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const compression = require('compression');
const NodeCache = require('node-cache');
const dotenv = require('dotenv');

dotenv.config(); // MUAT VARIABEL LINGKUNGAN DARI .env DI SINI!

const app = express();
const port = process.env.PORT || 3001;
const cache = new NodeCache({ stdTTL: 600 }); // Cache akan kedaluwarsa setelah 600 detik (10 menit)

// GLOBAL APP SETTINGS
app.set('cache', cache); // Set cache instance di app object agar bisa diakses di route handlers

// REQUIRE MODEL DI SINI (GLOBAL) agar bisa diakses oleh seedData dan routes lainnya
// Pastikan tidak menggunakan destructuring ({}) saat mengimpor model
// karena diekspor sebagai module.exports = mongoose.model(...)
const Question = require('./models/Question');
const Leaderboard = require('./models/Leaderboard');
const Feedback = require('./models/Feedback');

// MIDDLEWARE
app.use(cors({ origin: 'http://localhost:3000' })); // Izinkan frontend di localhost:3000
app.use(express.json()); // Parsing body request sebagai JSON
app.use(compression()); // Kompresi respons HTTP untuk performa lebih baik
app.use('/public', express.static('public')); // Sajikan file statis dari folder public

// KONEKSI MONGODB
mongoose.connection.on('connected', () => console.log('Terhubung ke MongoDB'));
mongoose.connection.on('error', (err) => console.error('Kesalahan koneksi MongoDB:', err.message));
mongoose.connection.on('disconnected', () => console.log('MongoDB terputus'));

// Debugging: Periksa apakah MONGODB_URI berhasil dimuat
console.log("MONGODB_URI yang digunakan:", process.env.MONGODB_URI ? 'URI tersedia' : 'URI TIDAK DITEMUKAN atau KOSONG');

mongoose.connect(process.env.MONGODB_URI)
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err.stack));

// CACHE MIDDLEWARE
const cacheMiddleware = (keyPrefix) => (req, res, next) => {
  // Membuat cacheKey lebih spesifik, bisa berdasarkan missionId, tipe, atau 'all'
  const cacheKey = `${keyPrefix}-${req.params.missionId || req.query.type || 'all'}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    console.log(`Mengambil dari cache: ${cacheKey}`);
    return res.json(cached);
  }

  // Override res.json untuk menyimpan data ke cache sebelum mengirim respons
  const originalJson = res.json;
  res.json = function (data) {
    console.log(`Menyimpan ke cache: ${cacheKey}`);
    cache.set(cacheKey, data);
    originalJson.call(this, data);
  };
  next();
};

module.exports = { cacheMiddleware }; // Export cacheMiddleware agar bisa digunakan di route files

// ROUTE HANDLERS
const questionRoutes = require('./routes/questionRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Untuk manajemen pertanyaan oleh admin

app.use('/api/questions', questionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes); // Gunakan route admin

// FUNGSI SEED DATA
const seedData = async () => {
  try {
    const missions = ['misi-1', 'misi-2', 'misi-3'];
    for (const missionId of missions) {
      const count = await Question.countDocuments({ missionId });
      if (count === 0) {
        const questions = [
          { type: 'pg', questionText: 'Berapa rata-rata dari 2, 4, 6, 8, 10?', options: ['6', '7', '8', '5'], correctAnswer: '6', score: 10, missionId },
          { type: 'benar-salah', questionText: 'Median dari 3, 5, 7, 9 adalah 6?', options: ['Benar', 'Salah'], correctAnswer: 'Salah', score: 10, missionId },
          { type: 'audio-menjodohkan', questionText: 'Dengarkan audio dan pilih pasangan yang tepat!', audioUrl: '/public/audio/sample.mp3', options: ['Mean', 'Median', 'Mode'], correctAnswer: 'Mean', score: 15, missionId },
          { type: 'uraian', questionText: 'Jelaskan apa itu modus dalam statistika!', correctAnswer: 'nilai yang paling sering muncul', score: 20, missionId },
          { type: 'gambar-isian', questionText: 'Lihat gambar tabel ini, masukkan rata-ratanya:', imageUrl: '/public/images/table.png', correctAnswer: '7', score: 15, missionId },
          // Pertanyaan khusus misi
          ...(missionId === 'misi-2' ? [{ type: 'drag-and-drop', questionText: 'Pasangkan data berikut ke kategori yang benar:', options: ['10', '20', '30'], targets: ['Kecil', 'Sedang', 'Besar'], correctAnswer: '10 -> Kecil,20 -> Sedang,30 -> Besar', score: 15, missionId }] : []),
          ...(missionId === 'misi-3' ? [{ type: 'drag-and-drop', questionText: 'Sesuikan angka dengan tingkatannya:', options: ['5', '15', '25'], targets: ['Rendah', 'Sedang', 'Tinggi'], correctAnswer: '5 -> Rendah,15 -> Sedang,25 -> Tinggi', score: 15, missionId }] : [])
        ];
        await Question.insertMany(questions);
        console.log(`Seeded ${questions.length} pertanyaan untuk ${missionId}`);
      } else {
        console.log(`Ditemukan ${count} pertanyaan untuk ${missionId}, seeding dilewati.`);
      }
    }
  } catch (err) {
    console.error('Kesalahan saat seeding data:', err);
  }
};

// Panggil fungsi seedData setelah koneksi MongoDB terbuka
mongoose.connection.once('open', () => {
  console.log("Koneksi MongoDB terbuka, mencoba seeding data...");
  seedData().catch(err => console.error('Kesalahan eksekusi seeding:', err.stack));

  // Mulai server Express
  app.listen(port, () => {
    console.log(`Server NurMath berjalan di http://localhost:${port}`);
  });
});