// server/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const compression = require('compression');
const NodeCache = require('node-cache');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const cache = new NodeCache({ stdTTL: 600 });

app.set('cache', cache);

const Question = require('./models/Question');
const Leaderboard = require('./models/Leaderboard');
const Feedback = require('./models/Feedback');

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(compression());
app.use('/public', express.static('public'));

mongoose.connection.on('connected', () => console.log('Connected to MongoDB'));
mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err.message));
mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));

console.log("MONGODB_URI used:", process.env.MONGODB_URI ? 'URI available' : 'URI NOT FOUND or EMPTY');

mongoose.connect(process.env.MONGODB_URI)
  .catch(err => console.error('Failed to connect to MongoDB:', err.stack));

const cacheMiddleware = (keyPrefix) => (req, res, next) => {
  const cacheKey = `${keyPrefix}-${req.params.missionId || req.query.type || 'all'}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    console.log(`Mengambil dari cache: ${cacheKey}`);
    return res.json(cached);
  }

  const originalJson = res.json;
  res.json = function (data) {
    console.log(`Menyimpan ke cache: ${cacheKey}`);
    cache.set(cacheKey, data);
    originalJson.call(this, data);
  };
  next();
};

// =======================================================
// PERBAIKI BAGIAN INI:
// Panggil fungsi yang diekspor oleh file rute dan teruskan cacheMiddleware padanya
// =======================================================
app.use('/api/questions', require('./routes/questionRoutes')(cacheMiddleware)); // <-- DI SINI PERBAIKANNYA
app.use('/api/leaderboard', require('./routes/leaderboardRoutes')(cacheMiddleware)); // <-- DI SINI PERBAIKANNYA
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
// =======================================================


const seedData = async () => {
  try {
    const missions = ['misi-1', 'misi-2', 'misi-3'];
    for (const missionId of missions) {
      const count = await Question.countDocuments({ missionId });
      if (count === 0) {
        let questions = [];
        if (missionId === 'misi-1') {
          questions = [
            { type: 'pg', questionText: 'Apa itu data?\nPilihan\nA. Cerita\nB. Informasi\nC. Angka saja\nD. Tanda baca', options: ['A. Cerita', 'B. Informasi', 'C. Angka saja', 'D. Tanda baca'], correctAnswer: 'B. Informasi', score: 1, missionId }, // Score 1 as per table
            { type: 'benar-salah', questionText: 'Berikanlah pernyatan benar atau salah pada informasi berikut!\nData numerik adalah data berupa angka yang bisa dihitung\nPilihan\nBenar \nSalah', options: ['Benar', 'Salah'], correctAnswer: 'Benar', score: 1, missionId }, // Score 1 as per table
            { type: 'audio-menjodohkan', questionText: 'Dengarkan audio berikut!\nJenis data yang tidak berbentuk angka tetapi berupa kategori seperti warna favorit atau hobi disebut data\nRekam suaramu untuk menjawab', audioUrl: '/public/audio/sample_numeric.mp3', options: ['Kategorik', 'Numerik', 'Nominal', 'Ordinal'], correctAnswer: 'Numerik', score: 2, missionId }, // Score 2. Added audioUrl and placeholder options. You need to provide a sample_numeric.mp3 file in public/audio.
            {
              type: 'menjodohkan', // Added 'menjodohkan' type
              questionText: 'Klasifikasikan data-data yang kita peroleh dari pernyataan dibawah ini apakah masuk ke dalam data kategorik atau numerik?\na. Banyak pengguna internet di Indonesia\nb. Urutan media sosial terbanyak yang digunakan di Indonesia\nc. Lamanya waktu mengakses internet perhari di Indonesia\nd. Macam-macam media sosial yang diakses oleh pengguna internet di Indonesia',
              options: [ // Options to be displayed on the left (items to match)
                  'a. Banyak pengguna internet di Indonesia',
                  'b. Urutan media sosial terbanyak yang digunakan di Indonesia',
                  'c. Lamanya waktu mengakses internet perhari di Indonesia',
                  'd. Macam-macam media sosial yang diakses oleh pengguna internet di Indonesia'
              ],
              targets: ['Kategorik', 'Numerik'], // The actual targets to match to
              correctAnswer: { // Correct answers for matching, mapping item to target
                'a. Banyak pengguna internet di Indonesia': 'Numerik',
                'b. Urutan media sosial terbanyak yang digunakan di Indonesia': 'Kategorik',
                'c. Lamanya waktu mengakses internet perhari di Indonesia': 'Numerik',
                'd. Macam-macam media sosial yang diakses oleh pengguna internet di Indonesia': 'Kategorik'
              },
              score: 3,
            },
            { type: 'uraian', questionText: 'Sebutkan lima macam teknik pengumpulan data!', correctAnswer: 'Wawancara, Observasi, Eksperimen, Kuesioner, Studi Pustaka', score: 3, missionId },
            { type: 'gambar-isian', questionText: 'Andi ingin mengetahui jenis makanan favorit teman-temannya. Ia membuat daftar pertanyaan dan membagikannya melalui Google Form. Teknik pengumpulan data yang dilakukan Andi adalah', imageUrl: '/public/images/google_form.png', correctAnswer: 'Angket', score: 2, missionId },
          ];
        } else if (missionId === 'misi-2') {
          questions = [
            {
              type: 'drag-and-drop',
              questionText: 'Perhatikan daftar data berikut ini. Seret masing-masing contoh ke kolom jenis data yang sesuai.\nData:\n• Tinggi badan siswa dalam cm\n• Warna kesukaan siswa\n• Jumlah buku yang dimiliki\n• Hobi siswa\n• Nilai ujian matematika\n• Merek sepatu yang digunakan',
              options: [
                'Tinggi badan siswa dalam cm',
                'Warna kesukaan siswa',
                'Jumlah buku yang dimiliki',
                'Hobi siswa',
                'Nilai ujian matematika',
                'Merek sepatu yang digunakan'
              ],
              targets: ['Data Numerik', 'Data Kategorik'], // These are the drop zones
              correctAnswer: { // Map each option to its correct target
                'Tinggi badan siswa dalam cm': 'Data Numerik',
                'Jumlah buku yang dimiliki': 'Data Numerik',
                'Nilai ujian matematika': 'Data Numerik',
                'Warna kesukaan siswa': 'Data Kategorik',
                'Hobi siswa': 'Data Kategorik',
                'Merek sepatu yang digunakan': 'Data Kategorik'
              },
              score: 2,
            },
            { type: 'isian-singkat', questionText: 'Dengarkan audio berikut!\n“Saya meneliti ukuran sepatu siswa kelas 7A dengan mencatat langsung ukuran sepatu yang t disimpan pada rak kelas.” Dari informasi tersebut termasuk jenis data… dengan teknik…', audioUrl: '/public/audio/sample_observasi.mp3', correctAnswer: 'Jenis data numerik dengan Teknik observasi', score: 2, missionId },
            {
              type: 'ceklis',
              questionText: 'Petunjuk soal:\nSeorang guru ingin mengumpulkan data tentang jenis makanan favorit siswa di kantin.\nGuru tersebut bingung memilih teknik pengumpulan data yang tepat.\nDari pilihan berikut, manakah bentuk representasi yang menunjukkan teknik pengumpulan data yang paling sesuai?\nCeklis dua jawaban yang benar.\nA. Guru membuat daftar pertanyaan dan menyebarkannya ke siswa melalui Google Form.\nB. Guru berdiri di depan kantin dan mencatat makanan yang paling banyak dibeli siswa.\nC. Guru membaca buku tentang gizi makanan siswa di perpustakaan.\nD. Guru menebak makanan yang mungkin disukai berdasarkan pengalamannya.',
              options: [
                'A. Guru membuat daftar pertanyaan dan menyebarkannya ke siswa melalui Google Form.',
                'B. Guru berdiri di depan kantin dan mencatat makanan yang paling banyak dibeli siswa.',
                'C. Guru membaca buku tentang gizi makanan siswa di perpustakaan.',
                'D. Guru menebak makanan yang mungkin disukai berdasarkan pengalamannya.'
              ],
              correctAnswer: [
                'A. Guru membuat daftar pertanyaan dan menyebarkannya ke siswa melalui Google Form.',
                'B. Guru berdiri di depan kantin dan mencatat makanan yang paling banyak dibeli siswa.'
              ],
              score: 2,
            },
            {
              type: 'pg',
              questionText: 'Petunjuk soal:\nSeorang peneliti ingin mengumpulkan data tentang jam tidur siswa setiap malam dan data tentang warna sepatu yang mereka pakai ke sekolah.\nManakah dari pernyataan berikut yang paling tepat untuk menjelaskan jenis data dan teknik pengumpulan yang mungkin digunakan?\nA. Kedua data termasuk numerik dan dapat dikumpulkan dengan observasi.\nB. Data jam tidur adalah numerik, sedangkan warna sepatu adalah kategorik. Keduanya bisa dikumpulkan melalui wawancara.\nC. Data jam tidur adalah kategorik, sedangkan warna sepatu adalah numerik.\nD. Data jam tidur dan warna sepatu sama-sama dikumpulkan lewat eksperimen.',
              options: [
                'A. Kedua data termasuk numerik dan dapat dikumpulkan dengan observasi.',
                'B. Data jam tidur adalah numerik, sedangkan warna sepatu adalah kategorik. Keduanya bisa dikumpulkan melalui wawancara.',
                'C. Data jam tidur adalah kategorik, sedangkan warna sepatu adalah numerik.',
                'D. Data jam tidur dan warna sepatu sama-sama dikumpulkan lewat eksperimen.'
              ],
              correctAnswer: 'B. Data jam tidur adalah numerik, sedangkan warna sepatu adalah kategorik. Keduanya bisa dikumpulkan melalui wawancara.',
              score: 1,
            },
            { type: 'isian-singkat', questionText: 'Instruksi soal:\nKamu diminta untuk membantu guru mengumpulkan data tentang warna tas yang digunakan oleh siswa kelas 7 secara langsung\nTulislah jenis data dan teknik pengumpulan data yang paling sesuai untuk kegiatan tersebut.', correctAnswer: 'Kategorik Observasi', score: 2, missionId },
            {
              type: 'ya-tidak', // Single ya/tidak
              questionText: 'Bacalah informasi berikut ini!\nSeorang siswa ingin mengetahui berapa banyak teman sekelasnya yang membawa bekal setiap hari. Ia lalu membuat kuesioner dan membagikannya ke seluruh teman sekelas untuk diisi secara anonim.\nPertanyaan:\nApakah cara pengumpulan data yang dilakukan siswa tersebut sudah sesuai dengan jenis data yang ingin diperoleh?',
              options: ['Ya', 'Tidak'],
              correctAnswer: 'Ya',
              score: 1,
            },
          ];
        } else if (missionId === 'misi-3') {
          questions = [
            {
              type: 'drag-and-drop',
              questionText: 'Seorang siswa ingin meneliti jenis olahraga favorit di sekolah. Ia tahu bahwa ada beberapa teknik pengumpulan data, tetapi tidak yakin mana yang paling sesuai.\nSusunlah langkah-langkah yang benar dan logis berdasarkan pemahaman konsep jenis dan teknik pengumpulan data agar siswa dapat memperoleh data yang tepat.\nSusun langkah-langkah berikut secara urut dari awal hingga akhir:\n1. Menganalisis apakah data yang dikumpulkan termasuk numerik atau kategorik\n2. Menyebarkan angket kepada seluruh siswa\n3. Merancang pertanyaan pilihan ganda tentang olahraga favorit\n4. Menyimpulkan hasil dan menyatakan jenis data yang dikumpulkan\n5. Menentukan teknik pengumpulan data yang sesuai',
              options: [
                '1. Menganalisis apakah data yang dikumpulkan termasuk numerik atau kategorik',
                '2. Menyebarkan angket kepada seluruh siswa',
                '3. Merancang pertanyaan pilihan ganda tentang olahraga favorit',
                '4. Menyimpulkan hasil dan menyatakan jenis data yang dikumpulkan',
                '5. Menentukan teknik pengumpulan data yang sesuai'
              ],
              targets: ['Posisi 1', 'Posisi 2', 'Posisi 3', 'Posisi 4', 'Posisi 5'], // Generic targets for ordered drag-and-drop
              correctAnswer: { // Map each option to its correct ordered target
                '1. Menganalisis apakah data yang dikumpulkan termasuk numerik atau kategorik': 'Posisi 1',
                '5. Menentukan teknik pengumpulan data yang sesuai': 'Posisi 2',
                '3. Merancang pertanyaan pilihan ganda tentang olahraga favorit': 'Posisi 3',
                '2. Menyebarkan angket kepada seluruh siswa': 'Posisi 4',
                '4. Menyimpulkan hasil dan menyatakan jenis data yang dikumpulkan': 'Posisi 5'
              },
              score: 4,
            },
            {
                type: 'ya-tidak-multi', // New type for multi-statement Ya/Tidak
                questionText: 'Berikut beberapa pernyataan tentang data dan teknik pengumpulan data.\nTandai dengan YA jika pernyataan tersebut termasuk kategori data kategorik, dan TIDAK jika bukan.',
                statements: [
                    'Data yang berisi nama jenis buah yang disukai siswa.',
                    'Data berupa hasil pengukuran suhu tubuh siswa.',
                    'Teknik pengumpulan data dengan mewawancarai langsung responden.',
                    'Data berupa angka banyaknya buku yang dibaca setiap bulan.',
                    'Teknik pengumpulan data dengan mengamati aktivitas siswa tanpa bertanya.'
                ],
                correctAnswer: ['Ya', 'Tidak', 'Tidak', 'Tidak', 'Tidak'], // Array of correct answers for each statement
                score: 4,
            },
            {
              type: 'ceklis',
              questionText: 'Dari data tinggi pemain berikut:\n• Adi = 160 cm\n• Budi = 165 cm\n• Cecep = 160 cm\n• Dani = 170 cm\n• Eko = 165 cm\n• Fulan = 170 cm\nPernyataan manakah yang tepat mengenai pemain dengan tinggi badan yang sama? (Jawaban bisa lebih dari satu)\nA. Adi dan Dani memiliki tinggi yang sama.\nB. Budi dan Eko memiliki tinggi yang sama\nC. Cecep dan Fulan memiliki tinggi yang sama.\nD. Dani dan Fulan memiliki tinggi yang sama.',
              options: [
                'A. Adi dan Dani memiliki tinggi yang sama.',
                'B. Budi dan Eko memiliki tinggi yang sama',
                'C. Cecep dan Fulan memiliki tinggi yang sama.',
                'D. Dani dan Fulan memiliki tinggi yang sama.'
              ],
              correctAnswer: [
                'B. Budi dan Eko memiliki tinggi yang sama',
                'D. Dani dan Fulan memiliki tinggi yang sama.'
              ],
              score: 2,
            },
            {
              type: 'pg',
              questionText: 'Seorang peneliti ingin mengumpulkan data tentang warna baju favorit siswa dan tinggi badan mereka. Teknik pengumpulan data yang paling tepat adalah…\nA. Wawancara untuk warna baju favorit dan pencatatan langsung untuk tinggi badan.\nB. Observasi untuk warna baju favorit dan angket untuk tinggi badan.\nC. Angket untuk warna baju favorit dan wawancara untuk tinggi badan.\nD. Pencatatan langsung untuk warna baju favorit dan wawancara untuk tinggi badan.',
              options: [
                'A. Wawancara untuk warna baju favorit dan pencatatan langsung untuk tinggi badan.',
                'B. Observasi untuk warna baju favorit dan angket untuk tinggi badan.',
                'C. Angket untuk warna baju favorit dan wawancara untuk tinggi badan.',
                'D. Pencatatan langsung untuk warna baju favorit dan wawancara untuk tinggi badan.'
              ],
              correctAnswer: 'A. Wawancara untuk warna baju favorit dan pencatatan langsung untuk tinggi badan.',
              score: 1,
            },
            { type: 'uraian', questionText: 'Buatlah rencana alur investigasi Statistika', correctAnswer: 'Merumuskan pertanyaan, Mengumpulkan data, Mengolah dan Menganalisis Data, Menginterpretasikan Data', score: 2, missionId },
            {
                type: 'benar-salah-multi', // New type for multi-statement Benar/Salah
                questionText: 'Baca setiap pernyataan berikut lalu tentukan apakah pernyataan tersebut BENAR atau SALAH\nPernyataan:\n1. “Menggunakan teknik observasi untuk mengumpulkan data tentang warna tas siswa adalah cara yang efektif karena data tersebut kategorik dan mudah diamati secara langsung.”\n2. “Jika data yang dikumpulkan berupa jumlah jam belajar siswa, maka teknik pengumpulan data paling tepat adalah wawancara dengan pertanyaan terbuka.”\n3. “Untuk mendapatkan data yang valid tentang makanan favorit siswa, melakukan wawancara tanpa daftar pertanyaan yang jelas sudah cukup.”\n4. “Pengumpulan data melalui angket dengan pilihan jawaban yang sudah ditentukan dapat membantu mempercepat proses pengolahan data numerik dan kategorik.”',
                statements: [
                    '“Menggunakan teknik observasi untuk mengumpulkan data tentang warna tas siswa adalah cara yang efektif karena data tersebut kategorik dan mudah diamati secara langsung.”',
                    '“Jika data yang dikumpulkan berupa jumlah jam belajar siswa, maka teknik pengumpulan data paling tepat adalah wawancara dengan pertanyaan terbuka.”',
                    '“Untuk mendapatkan data yang valid tentang makanan favorit siswa, melakukan wawancara tanpa daftar pertanyaan yang jelas sudah cukup.”',
                    '“Pengumpulan data melalui angket dengan pilihan jawaban yang sudah ditentukan dapat membantu mempercepat proses pengolahan data numerik dan kategorik.”'
                ],
                correctAnswer: ['Benar', 'Salah', 'Salah', 'Benar'], // Array of correct answers for each statement
                score: 3,
            },
          ];
        }
        await Question.insertMany(questions);
        console.log(`Seeded ${questions.length} questions for ${missionId}`);
      } else {
        console.log(`Found ${count} questions for ${missionId}, skipping seeding.`);
      }
    }
  } catch (err) {
    console.error('Error seeding data:', err);
  }
};

mongoose.connection.once('open', () => {
  console.log("Koneksi MongoDB terbuka, mencoba seeding data...");
  seedData().catch(err => console.error('Kesalahan eksekusi seeding:', err.stack));

  app.listen(port, () => {
    console.log(`NurMath server berjalan di http://localhost:${port}`);
  });
});