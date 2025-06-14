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
  .catch(err => console.error('Failed to connect to PostgreSQL:', err.stack));

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

// Create tables if they don't exist
const initializeTables = async () => {
  try {
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
    console.log('Tables created or already exist.');
  } catch (err) {
    console.error('Error creating tables:', err.stack);
  }
};

// Seed data function
const seedData = async () => {
  try {
    const missions = ['misi-1', 'misi-2', 'misi-3'];
    for (const missionId of missions) {
      const { rows } = await client.query('SELECT COUNT(*) as count FROM questions WHERE mission_id = $1', [missionId]);
      const count = parseInt(rows[0].count);

      if (count === 0) {
        let questions = [];
        if (missionId === 'misi-1') {
          questions = [
            {
              type: 'pg',
              question_text: 'Apa itu data?\nPilihan\nA. Cerita\nB. Informasi\nC. Angka saja\nD. Tanda baca',
              options: ['A. Cerita', 'B. Informasi', 'C. Angka saja', 'D. Tanda baca'],
              correct_answer: 'B. Informasi',
              score: 1,
              mission_id: missionId,
            },
            {
              type: 'benar-salah',
              question_text: 'Berikanlah pernyataan benar atau salah pada informasi berikut!\nData numerik adalah data berupa angka yang bisa dihitung\nPilihan\nBenar \nSalah',
              options: ['Benar', 'Salah'],
              correct_answer: 'Benar',
              score: 1,
              mission_id: missionId,
            },
            {
              type: 'audio-isian',
              question_text: 'Dengarkan audio berikut!\nJenis data yang tidak berbentuk angka tetapi berupa kategori seperti warna favorit atau hobi disebut data\nRekam suaramu untuk menjawab jawabannya nya itu berupa menuliskan angka',
              audio_url: '/public/audio/sample_kategorik.mp3',
              correct_answer: 'kategorik',
              score: 2,
              mission_id: missionId,
            },
            {
              type: 'menjodohkan',
              question_text: 'Klasifikasikan data-data yang kita peroleh dari pernyataan dibawah ini apakah masuk ke dalam data kategorik atau numerik?',
              options: [
                'a. Banyak pengguna internet di Indonesia',
                'b. Urutan media sosial terbanyak yang digunakan di Indonesia',
                'c. Lamanya waktu mengakses internet perhari di Indonesia',
                'd. Macam-macam media sosial yang diakses oleh pengguna internet di Indonesia'
              ],
              targets: ['Kategorik', 'Numerik'],
              correct_answer: {
                'a. Banyak pengguna internet di Indonesia': 'Numerik',
                'b. Urutan media sosial terbanyak yang digunakan di Indonesia': 'Kategorik',
                'c. Lamanya waktu mengakses internet perhari di Indonesia': 'Numerik',
                'd. Macam-macam media sosial yang diakses oleh pengguna internet di Indonesia': 'Kategorik'
              },
              score: 3,
              mission_id: missionId,
            },
            {
              type: 'uraian',
              question_text: 'Sebutkan lima macam teknik pengumpulan data!',
              correct_answer: 'Wawancara, Observasi, Eksperimen, Kuesioner, Studi Pustaka',
              score: 3,
              mission_id: missionId,
            },
            {
              type: 'gambar-isian',
              question_text: 'Andi ingin mengetahui jenis makanan favorit teman-temannya. Ia membuat daftar pertanyaan dan membagikannya melalui Google Form. Teknik pengumpulan data yang dilakukan Andi adalah',
              image_url: '/public/images/google_form.png',
              correct_answer: 'Angket',
              score: 2,
              mission_id: missionId,
            },
          ];
        } else if (missionId === 'misi-2') {
          questions = [
            {
                type: 'drag-and-drop',
                question_text: 'Perhatikan daftar data berikut ini. Seret masing-masing contoh ke kolom jenis data yang sesuai.\nData:\n• Tinggi badan siswa dalam cm\n• Warna kesukaan siswa\n• Jumlah buku yang dimiliki\n• Hobi siswa\n• Nilai ujian matematika\n• Merek sepatu yang digunakan',
                options: [
                  'Tinggi badan siswa dalam cm',
                  'Warna kesukaan siswa',
                  'Jumlah buku yang dimiliki',
                  'Hobi siswa',
                  'Nilai ujian matematika',
                  'Merek sepatu yang digunakan'
                ],
                targets: ['Data Numerik', 'Data Kategorik'],
                correct_answer: {
                  'Tinggi badan siswa dalam cm': 'Data Numerik',
                  'Jumlah buku yang dimiliki': 'Data Numerik',
                  'Nilai ujian matematika': 'Data Numerik',
                  'Warna kesukaan siswa': 'Data Kategorik',
                  'Hobi siswa': 'Data Kategorik',
                  'Merek sepatu yang digunakan': 'Data Kategorik'
                },
                score: 2,
                mission_id: missionId,
              },
              {
                type: 'isian-singkat',
                question_text: 'Dengarkan audio berikut!\n“Saya meneliti ukuran sepatu siswa kelas 7A dengan mencatat langsung ukuran sepatu yang t disimpan pada rak kelas.” Dari informasi tersebut termasuk jenis data… dengan teknik…',
                audio_url: '/public/audio/sample_observasi.mp3',
                correct_answer: 'Jenis data numerik dengan Teknik observasi',
                score: 2,
                mission_id: missionId,
              },
              {
                type: 'ceklis',
                question_text: 'Petunjuk soal:\nSeorang guru ingin mengumpulkan data tentang jenis makanan favorit siswa di kantin.\nGuru tersebut bingung memilih teknik pengumpulan data yang tepat.\nDari pilihan berikut, manakah bentuk representasi yang menunjukkan teknik pengumpulan data yang paling sesuai?\nCeklis dua jawaban yang benar.\nA. Guru membuat daftar pertanyaan dan menyebarkannya ke siswa melalui Google Form.\nB. Guru berdiri di depan kantin dan mencatat makanan yang paling banyak dibeli siswa.\nC. Guru membaca buku tentang gizi makanan siswa di perpustakaan.\nD. Guru menebak makanan yang mungkin disukai berdasarkan pengalamannya.',
                options: [
                  'A. Guru membuat daftar pertanyaan dan menyebarkannya ke siswa melalui Google Form.',
                  'B. Guru berdiri di depan kantin dan mencatat makanan yang paling banyak dibeli siswa.',
                  'C. Guru membaca buku tentang gizi makanan siswa di perpustakaan.',
                  'D. Guru menebak makanan yang mungkin disukai berdasarkan pengalamannya.'
                ],
                correct_answer: [
                  'A. Guru membuat daftar pertanyaan dan menyebarkannya ke siswa melalui Google Form.',
                  'B. Guru berdiri di depan kantin dan mencatat makanan yang paling banyak dibeli siswa.'
                ],
                score: 2,
                mission_id: missionId,
              },
              {
                type: 'pg',
                question_text: 'Petunjuk soal:\nSeorang peneliti ingin mengumpulkan data tentang jam tidur siswa setiap malam dan data tentang warna sepatu yang mereka pakai ke sekolah.\nManakah dari pernyataan berikut yang paling tepat untuk menjelaskan jenis data dan teknik pengumpulan yang mungkin digunakan?\nA. Kedua data termasuk numerik dan dapat dikumpulkan dengan observasi.\nB. Data jam tidur adalah numerik, sedangkan warna sepatu adalah kategorik. Keduanya bisa dikumpulkan melalui wawancara.\nC. Data jam tidur adalah kategorik, sedangkan warna sepatu adalah numerik.\nD. Data jam tidur dan warna sepatu sama-sama dikumpulkan lewat eksperimen.',
                options: [
                  'A. Kedua data termasuk numerik dan dapat dikumpulkan dengan observasi.',
                  'B. Data jam tidur adalah numerik, sedangkan warna sepatu adalah kategorik. Keduanya bisa dikumpulkan melalui wawancara.',
                  'C. Data jam tidur adalah kategorik, sedangkan warna sepatu adalah numerik.',
                  'D. Data jam tidur dan warna sepatu sama-sama dikumpulkan lewat eksperimen.'
                ],
                correct_answer: 'B. Data jam tidur adalah numerik, sedangkan warna sepatu adalah kategorik. Keduanya bisa dikumpulkan melalui wawancara.',
                score: 1,
                mission_id: missionId,
              },
              {
                type: 'isian-singkat',
                question_text: 'Instruksi soal:\nKamu diminta untuk membantu guru mengumpulkan data tentang warna tas yang digunakan oleh siswa kelas 7 secara langsung\nTulislah jenis data dan teknik pengumpulan data yang paling sesuai untuk kegiatan tersebut.',
                correct_answer: 'Kategorik Observasi',
                score: 2,
                mission_id: missionId,
              },
              {
                type: 'ya-tidak',
                question_text: 'Bacalah informasi berikut ini!\nSeorang siswa ingin mengetahui berapa banyak teman sekelasnya yang membawa bekal setiap hari. Ia lalu membuat kuesioner dan membagikannya ke seluruh teman sekelas untuk diisi secara anonim.\nPertanyaan:\nApakah cara pengumpulan data yang dilakukan siswa tersebut sudah sesuai dengan jenis data yang ingin diperoleh?',
                options: ['Ya', 'Tidak'],
                correct_answer: 'Ya',
                score: 1,
                mission_id: missionId,
              },
            ];
          } else if (missionId === 'misi-3') {
            questions = [
              {
                type: 'drag-and-drop',
                question_text: 'Seorang siswa ingin meneliti jenis olahraga favorit di sekolah. Ia tahu bahwa ada beberapa teknik pengumpulan data, tetapi tidak yakin mana yang paling sesuai.\nSusunlah langkah-langkah yang benar dan logis berdasarkan pemahaman konsep jenis dan teknik pengumpulan data agar siswa dapat memperoleh data yang tepat.\nSusun langkah-langkah berikut secara urut dari awal hingga akhir:\n1. Menganalisis apakah data yang dikumpulkan termasuk numerik atau kategorik\n2. Menyebarkan angket kepada seluruh siswa\n3. Merancang pertanyaan pilihan ganda tentang olahraga favorit\n4. Menyimpulkan hasil dan menyatakan jenis data yang dikumpulkan\n5. Menentukan teknik pengumpulan data yang sesuai',
                options: [
                  '1. Menganalisis apakah data yang dikumpulkan termasuk numerik atau kategorik',
                  '2. Menyebarkan angket kepada seluruh siswa',
                  '3. Merancang pertanyaan pilihan ganda tentang olahraga favorit',
                  '4. Menyimpulkan hasil dan menyatakan jenis data yang dikumpulkan',
                  '5. Menentukan teknik pengumpulan data yang sesuai'
                ],
                targets: ['Posisi 1', 'Posisi 2', 'Posisi 3', 'Posisi 4', 'Posisi 5'],
                correct_answer: {
                  '1. Menganalisis apakah data yang dikumpulkan termasuk numerik atau kategorik': 'Posisi 1',
                  '5. Menentukan teknik pengumpulan data yang sesuai': 'Posisi 2',
                  '3. Merancang pertanyaan pilihan ganda tentang olahraga favorit': 'Posisi 3',
                  '2. Menyebarkan angket kepada seluruh siswa': 'Posisi 4',
                  '4. Menyimpulkan hasil dan menyatakan jenis data yang dikumpulkan': 'Posisi 5'
                },
                score: 4,
                mission_id: missionId,
              },
              {
                type: 'ya-tidak-multi',
                question_text: 'Berikut beberapa pernyataan tentang data dan teknik pengumpulan data.\nTandai dengan YA jika pernyataan tersebut termasuk kategori data kategorik, dan TIDAK jika bukan.',
                statements: [
                  'Data yang berisi nama jenis buah yang disukai siswa.',
                  'Data berupa hasil pengukuran suhu tubuh siswa.',
                  'Teknik pengumpulan data dengan mewawancarai langsung responden.',
                  'Data berupa angka banyaknya buku yang dibaca setiap bulan.',
                  'Teknik pengumpulan data dengan mengamati aktivitas siswa tanpa bertanya.'
                ],
                correct_answer: ['Ya', 'Tidak', 'Tidak', 'Tidak', 'Tidak'],
                score: 4,
                mission_id: missionId,
              },
              {
                type: 'ceklis',
                question_text: 'Dari data tinggi pemain berikut:\n• Adi = 160 cm\n• Budi = 165 cm\n• Cecep = 160 cm\n• Dani = 170 cm\n• Eko = 165 cm\n• Fulan = 170 cm\nPernyataan manakah yang tepat mengenai pemain dengan tinggi badan yang sama? (Jawaban bisa lebih dari satu)\nA. Adi dan Dani memiliki tinggi yang sama.\nB. Budi dan Eko memiliki tinggi yang sama\nC. Cecep dan Fulan memiliki tinggi yang sama.\nD. Dani dan Fulan memiliki tinggi yang sama.',
                options: [
                  'A. Adi dan Dani memiliki tinggi yang sama.',
                  'B. Budi dan Eko memiliki tinggi yang sama',
                  'C. Cecep dan Fulan memiliki tinggi yang sama.',
                  'D. Dani dan Fulan memiliki tinggi yang sama.'
                ],
                correct_answer: [
                  'B. Budi dan Eko memiliki tinggi yang sama',
                  'D. Dani dan Fulan memiliki tinggi yang sama.'
                ],
                score: 2,
                mission_id: missionId,
              },
              {
                type: 'pg',
                question_text: 'Seorang peneliti ingin mengumpulkan data tentang warna baju favorit siswa dan tinggi badan mereka. Teknik pengumpulan data yang paling tepat adalah…\nA. Wawancara untuk warna baju favorit dan pencatatan langsung untuk tinggi badan.\nB. Observasi untuk warna baju favorit dan angket untuk tinggi badan.\nC. Angket untuk warna baju favorit dan wawancara untuk tinggi badan.\nD. Pencatatan langsung untuk warna baju favorit dan wawancara untuk tinggi badan.',
                options: [
                  'A. Wawancara untuk warna baju favorit dan pencatatan langsung untuk tinggi badan.',
                  'B. Observasi untuk warna baju favorit dan angket untuk tinggi badan.',
                  'C. Angket untuk warna baju favorit dan wawancara untuk tinggi badan.',
                  'D. Pencatatan langsung untuk warna baju favorit dan wawancara untuk tinggi badan.'
                ],
                correct_answer: 'A. Wawancara untuk warna baju favorit dan pencatatan langsung untuk tinggi badan.',
                score: 1,
                mission_id: missionId,
              },
              {
                type: 'uraian',
                question_text: 'Buatlah rencana alur investigasi Statistika',
                correct_answer: 'Merumuskan pertanyaan, Mengumpulkan data, Mengolah dan Menganalisis Data, Menginterpretasikan Data',
                score: 2,
                mission_id: missionId,
              },
              {
                type: 'benar-salah-multi',
                question_text: 'Baca setiap pernyataan berikut lalu tentukan apakah pernyataan tersebut BENAR atau SALAH\nPernyataan:\n1. “Menggunakan teknik observasi untuk mengumpulkan data tentang warna tas siswa adalah cara yang efektif karena data tersebut kategorik dan mudah diamati secara langsung.”\n2. “Jika data yang dikumpulkan berupa jumlah jam belajar siswa, maka teknik pengumpulan data paling tepat adalah wawancara dengan pertanyaan terbuka.”\n3. “Untuk mendapatkan data yang valid tentang makanan favorit siswa, melakukan wawancara tanpa daftar pertanyaan yang jelas sudah cukup.”\n4. “Pengumpulan data melalui angket dengan pilihan jawaban yang sudah ditentukan dapat membantu mempercepat proses pengolahan data numerik dan kategorik.”',
                statements: [
                  '“Menggunakan teknik observasi untuk mengumpulkan data tentang warna tas siswa adalah cara yang efektif karena data tersebut kategorik dan mudah diamati secara langsung.”',
                  '“Jika data yang dikumpulkan berupa jumlah jam belajar siswa, maka teknik pengumpulan data paling tepat adalah wawancara dengan pertanyaan terbuka.”',
                  '“Untuk mendapatkan data yang valid tentang makanan favorit siswa, melakukan wawancara tanpa daftar pertanyaan yang jelas sudah cukup.”',
                  '“Pengumpulan data melalui angket dengan pilihan jawaban yang sudah ditentukan dapat membantu mempercepat proses pengolahan data numerik dan kategorik.”'
                ],
                correct_answer: ['Benar', 'Salah', 'Salah', 'Benar'],
                score: 3,
                mission_id: missionId,
              },
            ];
          }

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
  } catch (err) {
    console.error('Error seeding data:', err.stack);
  }
};

// Initialize app
const startApp = async () => {
  try {
    await initializeTables();
    await seedData();

    // Mount routes (pass client to routes for database access)
    app.use('/api/questions', require('./routes/questionRoutes')(cacheMiddleware, client));
    app.use('/api/leaderboard', require('./routes/leaderboardRoutes')(cacheMiddleware, client));
    app.use('/api/feedback', require('./routes/feedbackRoutes')(client));
    app.use('/api/admin', require('./routes/adminRoutes')(client));

    app.listen(port, () => {
      console.log(`NurMath server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error starting app:', err.stack);
  }
};

startApp();