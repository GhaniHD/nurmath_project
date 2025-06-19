const mission1Questions = [
  {
    type: 'pg',
    question_text: 'Apa itu data?',
    options: ['A. Cerita', 'B. Informasi', 'C. Angka saja', 'D. Tanda baca'],
    correct_answer: 'B. Informasi',
    score: 1,
  },
  {
    type: 'benar-salah',
    question_text: 'Berikanlah pernyataan benar atau salah pada informasi berikut!\n\nData numerik adalah data berupa angka yang bisa dihitung',
    options: ['Benar', 'Salah'],
    correct_answer: 'Benar',
    score: 1,
  },
  {
    type: 'audio-isian',
    question_text: 'Dengarkan audio berikut!\n',
    audio_url: 'audio/misi1data.mp3',
    correct_answer: 'Numerik',
    score: 2,
  },
  {
    type: 'menjodohkan',
    question_text: 'Klasifikasikan data-data yang kita peroleh dari pernyataan di bawah ini apakah masuk ke dalam data kategorik atau numerik?',
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
  },
  {
    type: 'uraian',
    question_text: 'Sebutkan lima macam teknik pengumpulan data!',
    correct_answer: 'Wawancara, Observasi, Eksperimen, Kuesioner, Studi Pustaka',
    score: 3,
  },
  {
    type: 'gambar-isian',
    question_text: 'Andi ingin mengetahui jenis makanan favorit teman-temannya. Ia membuat daftar pertanyaan dan membagikannya melalui Google Form. Teknik pengumpulan data yang dilakukan Andi adalah',
    image_url: 'images/google_form.png',
    correct_answer: 'Angket',
    score: 2,
  },
];

module.exports = mission1Questions;
