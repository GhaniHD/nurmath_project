const mission3Questions = [
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
    },
    {
      type: 'uraian',
      question_text: 'Buatlah rencana alur investigasi Statistika',
      correct_answer: 'Merumuskan pertanyaan, Mengumpulkan data, Mengolah dan Menganalisis Data, Menginterpretasikan Data',
      score: 2,
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
    },
  ];
  
  module.exports = mission3Questions;