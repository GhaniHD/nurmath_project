const mission5Questions = [
  {
    type: 'pg',
    question_text: 'Jenis diagram yang paling tepat untuk menyajikan data proporsi pengeluaran rumah tangga (makanan, transportasi, pendidikan, lainnya) adalah...',
    options: ['A. Tabel', 'B. Diagram Batang', 'C. Diagram Lingkaran', 'D. Plotline'],
    correct_answer: 'C. Diagram Lingkaran',
    score: 1,
  },
  {
    type: 'benar-salah',
    question_text: 'Seorang pedagang mencatat jumlah penjualan es teh selama 7 hari. Jika ingin melihat tren kenaikan atau penurunan penjualan dari hari ke hari, maka bentuk penyajian data yang paling tepat adalah diagram lingkaran',
    options: ['Benar', 'Salah'],
    correct_answer: 'Salah',
    score: 1,
  },
  {
    type: 'audio-isian',
    question_text: 'Dengarkan audio berikut!\n',
    audio_url: '/audio/sample_kategorik.mp3',
    correct_answer: '54',
    score: 2,
  },
  {
    type: 'menjodohkan',
    question_text: 'Petunjuk: Pasangkan nama data dengan bentuk representasi diagram yang paling sesuai',
    image_urls: [
      'http://localhost:3001/public/images/pie_chart.png',    // Example for option a or Diagram Lingkaran
      'http://localhost:3001/public/images/line_chart.png',   // Example for option c or Diagram Garis
      'http://localhost:3001/public/images/table.png',    // Example for option b or Diagram Lingkaran
      'http://localhost:3001/public/images/bar-chart.png'        // Example for option d or Tabel
    ],
    options: [
      'a. Banyak pengguna internet di Indonesia',
      'b. Urutan media sosial terbanyak yang digunakan di Indonesia',
      'c. Lamanya waktu mengakses internet perhari di Indonesia',
      'd. Macam-macam media sosial yang diakses oleh pengguna internet di Indonesia'
    ],
    targets: {
      'Diagram Batang': 'http://localhost:3001/public/images/bar.png',
      'Diagram Garis': 'http://localhost:3001/public/images/line_chart.png',
      'Diagram Lingkaran': 'http://localhost:3001/public/images/pie_chart.png',
      'Tabel': 'http://localhost:3001/public/images/table.png'
    },
    correct_answer: {
      'a. Banyak pengguna internet di Indonesia': 'http://localhost:3001/public/images/pie_chart.png',
      'b. Urutan media sosial terbanyak yang digunakan di Indonesia': 'http://localhost:3001/public/images/pie_chart.png',
      'c. Lamanya waktu mengakses internet perhari di Indonesia': 'http://localhost:3001/public/images/line_chart.png',
      'd. Macam-macam media sosial yang diakses oleh pengguna internet di Indonesia': 'http://localhost:3001/public/images/table.png'
    },
    score: 3,
  },
  {
    type: 'ya-tidak',
    question_text: 'Diberikan data jumlah siswa yang memilih jenis olahraga favorit di sekolah sebagai berikut:\n\nOlahraga\tJumlah Siswa\nSepak Bola\t36\nBadminton\t24\nRenang\t30\nBasket\t30\n\nSeorang guru ingin membuat diagram lingkaran dari data tersebut dan menghitung sudut untuk olahraga badminton sebagai berikut:\n24/120×360°=72°\nPernyataan\nPerhitungan besar sudut sudah tepat',
    options: ['Ya', 'Tidak'],   
    correct_answer: 'Ya',
    score: 3,
  },
  {
    type: 'gambar-isian',
    question_text: 'Sebuah diagram batang menunjukkan jumlah buku yang dibaca siswa selama satu minggu, Berapakah selisih jumlah buku terbanyak dan tersedikit yang dibaca dalam seminggu menurut diagram batang tersebut?',
    image_url: 'http://localhost:3001/public/images/tidakDiagrammisi2.png',
    correct_answer: '4',
    score: 2,
  },
];

module.exports = mission5Questions;