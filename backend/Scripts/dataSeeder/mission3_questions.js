const mission3Questions = [
  {
    type: 'drag-and-drop',
    question_text: 'Seorang siswa ingin meneliti jenis olahraga favorit di sekolah. Ia tahu bahwa ada beberapa teknik pengumpulan data, tetapi tidak yakin mana yang paling sesuai.\nSusunlah langkah-langkah yang benar dan logis berdasarkan pemahaman konsep jenis dan teknik pengumpulan data agar siswa dapat memperoleh data yang tepat.\nSusun langkah-langkah berikut secara urut dari awal hingga akhir:',
    options: [
      'Menganalisis apakah data yang dikumpulan termasuk numerik atau kategorik',
      'Menyebarkan angket kepada seluruh siswa',
      'Merancang pertanyaan pilihan ganda tentang olahraga favorit',
      'Menyimpulkan hasil dan menyatakan jenis data yang dikumpulan',
      'Menentukan teknik pengumpulan data yang sesuai'
    ],
    targets: ['Urutan Langkah'],
    correct_answer: [
      'Menganalisis apakah data yang dikumpulan termasuk numerik atau kategorik',
      'Menentukan teknik pengumpulan data yang sesuai',
      'Merancang pertanyaan pilihan ganda tentang olahraga favorit',
      'Menyebarkan angket kepada seluruh siswa',
      'Menyimpulkan hasil dan menyatakan jenis data yang dikumpulan'
    ],
    score: 20
  },
  {
    type: 'ya-tidak',
    question_text: 'Berikut beberapa pernyataan tentang data dan teknik pengumpulan data.\nTandai dengan YA jika pernyataan tersebut termasuk kategori data kategorik, dan TIDAK jika bukan.',
    options: [
      'Data yang berisi nama jenis buah yang disukai siswa.',
      'Data berupa hasil pengukuran suhu tubuh siswa.',
      'Teknik pengumpulan data dengan mewawancarai langsung responden.',
      'Data berupa angka banyaknya buku yang dibaca setiap bulan.',
      'Teknik pengumpulan data dengan mengamati aktivitas siswa tanpa bertanya.'
    ],
    correct_answer: ['Ya', 'Tidak', 'Tidak', 'Tidak', 'Tidak'],
    score: 15
  },
  {
    type: 'ceklis',
    question_text: 'Dari data tinggi pemain berikut:\n• Adi = 160 cm\n• Budi = 165 cm\n• Cecep = 160 cm\n• Dani = 170 cm\n• Eko = 165 cm\n• Fulan = 170 cm\nPernyataan manakah yang tepat mengenai pemain dengan tinggi badan yang sama? (Jawaban bisa lebih dari satu)',
    options: ['A. Adi dan Dani memiliki tinggi yang sama.', 'B. Budi dan Eko memiliki tinggi yang sama.', 'C. Cecep dan Fulan memiliki tinggi yang sama.', 'D. Dani dan Fulan memiliki tinggi yang sama.'],
    correct_answer: ['B', 'D'],
    score: 10
  },
  {
    type: 'pg',
    question_text: 'Seorang peneliti ingin mengumpulkan data tentang warna baju favorit siswa dan tinggi badan mereka. Teknik pengumpulan data yang paling tepat adalah…',
    options: ['A. Wawancara untuk warna baju favorit dan pencatatan langsung untuk tinggi badan.', 'B. Observasi untuk warna baju favorit dan angket untuk tinggi badan.', 'C. Angket untuk warna baju favorit dan wawancara untuk tinggi badan.', 'D. Pencatatan langsung untuk warna baju favorit dan wawancara untuk tinggi badan.'],
    correct_answer: 'A',
    score: 15
  },
  {
    type: 'isian-singkat',
    question_text: 'Buatlah rencana alur investigasi Statistika',
    correct_answer: '1. Merumuskan pertanyaan\n2. Mengumpulkan data\n3. Mengolah dan Menganalisis Data\n4. Menginterpretasikan Data',
    score: 20
  },
  {
    type: 'benar-salah',
    question_text: 'Baca setiap pernyataan berikut lalu tentukan apakah pernyataan tersebut BENAR atau SALAH',
    options: [
      '“Menggunakan teknik observasi untuk mengumpulkan data tentang warna tas siswa adalah cara yang efektif karena data tersebut kategorik dan mudah diamati secara langsung.”',
      '“Jika data yang dikumpulan berupa jumlah jam belajar siswa, maka teknik pengumpulan data paling tepat adalah wawancara dengan pertanyaan terbuka.”',
      '“Untuk mendapatkan data yang valid tentang makanan favorit siswa, melakukan wawancara tanpa daftar pertanyaan yang jelas sudah cukup.”',
      '“Pengumpulan data melalui angket dengan pilihan jawaban yang sudah ditentukan dapat membantu mempercepat proses pengolahan data numerik dan kategorik.”'
    ],
    correct_answer: ['Benar', 'Salah', 'Salah', 'Benar'],
    score: 15
  }
];

module.exports = mission3Questions;