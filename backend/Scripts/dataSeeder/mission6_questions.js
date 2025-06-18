const mission6Questions = [
  {
    type: 'drag-and-drop',
    question_text: 'Perhatikan daftar data berikut ini. Seret masing-masing contoh ke kolom jenis data yang sesuai\nData:\n• Tinggi badan siswa dalam cm\n• Warna kesukaan siswa\n• Jumlah buku yang dimiliki\n• Hobi siswa\n• Nilai ujian matematika\n• Merek sepatu yang digunakan\n\nSeret ke salah satu kolom dibawah ini\nData numerik\nData kategorik',
    options: [
      'Tinggi badan siswa dalam cm',
      'Warna kesukaan siswa',
      'Jumlah buku yang dimiliki',
      'Hobi siswa',
      'Nilai ujian matematika',
      'Merek sepatu yang digunakan'
    ],
    targets: ['Data numerik', 'Data kategorik'],
    correct_answer: {
      'Tinggi badan siswa dalam cm': 'Data numerik',
      'Jumlah buku yang dimiliki': 'Data numerik',
      'Nilai ujian matematika': 'Data numerik',
      'Warna kesukaan siswa': 'Data kategorik',
      'Hobi siswa': 'Data kategorik',
      'Merek sepatu yang digunakan': 'Data kategorik'
    },
    score: 2,
  },
  {
    type: 'isian-singkat',
    question_text: 'Dengarkan audio berikut!\n“Saya meneliti ukuran sepatu siswa kelas 7A dengan mencatat langsung ukuran sepatu yang t disimpan pada rak kelas.” Dari informasi tersebut termasuk jenis data… dengan teknik…\nRekam suaramu untuk menjawab',
    audio_url: '/public/audio/sample_observasi.mp3',
    correct_answer: 'Jenis data numerik dengan Teknik observasi',
    score: 2,
  },
  {
    type: 'ceklis',
    question_text: 'Petunjuk soal:\nSeorang guru ingin mengumpulkan data tentang jenis makanan favorit siswa di kantin.\nGuru tersebut bingung memilih teknik pengumpulan data yang tepat.\nDari pilihan berikut, manakah bentuk representasi yang menunjukkan teknik pengumpulan data yang paling sesuai?\nCeklis dua jawaban yang benar.',
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
  },
  {
    type: 'pg',
    question_text: 'Petunjuk soal:\nSeorang peneliti ingin mengumpulkan data tentang jam tidur siswa setiap malam dan data tentang warna sepatu yang mereka pakai ke sekolah.\nManakah dari pernyataan berikut yang paling tepat untuk menjelaskan jenis data dan teknik pengumpulan yang mungkin digunakan?',
    options: [
      'A. Kedua data termuk numerik dan dapat dikumpulkan dengan observasi.',
      'B. Data jam tidur adalah numerik, sedangkan warna sepatu adalah kategorik. Keduanya bisa dikumpulkan melalui wawancara.',
      'C. Data jam tidur adalah kategorik, sedangkan warna sepatu adalah numerik.',
      'D. Data jam tidur dan warna sepatu sama-sama dikumpulkan lewat eksperimen.'
    ],
    correct_answer: 'B. Data jam tidur adalah numerik, sedangkan warna sepatu adalah kategorik. Keduanya bisa dikumpulkan melalui wawancara.',
    score: 1,
  },
  {
    type: 'isian-singkat',
    question_text: 'Instruksi soal:\nKamu diminta untuk membantu guru mengumpulkan data tentang warna tas yang digunakan oleh siswa kelas 7 secara langsung\nTulislah jenis data dan teknik pengumpulan data yang paling sesuai untuk kegiatan tersebut.',
    correct_answer: 'Kategorik Observasi',
    score: 2,
  },
  {
    type: 'ya-tidak',
    question_text: 'Bacalah informasi berikut ini!\nSeorang siswa ingin mengetahui berapa banyak teman sekelasnya yang membawa bekal setiap hari. Ia lalu membuat kuesioner dan membagikannya ke seluruh teman sekelas untuk diisi secara anonim.\nPertanyaan:\nApakah cara pengumpulan data yang dilakukan siswa tersebut sudah sesuai dengan jenis data yang ingin diperoleh?',
    options: ['Ya', 'Tidak'],
    correct_answer: 'Ya',
    score: 1,
  },
];

module.exports = mission6Questions;