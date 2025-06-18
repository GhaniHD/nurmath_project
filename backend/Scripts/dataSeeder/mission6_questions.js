const mission6Question = [
    {
      type: 'pg',
      question_text: "Perhatikan data penjualan buah berikut:\n\nJenis buah | Jumlah (buah)\nApel | 20\nMangga | 15\nJeruk | 25\nPisang | 10\nJika data tersebut disajikan dalam diagram batang, maka diagram batang mana yang paling tepat?",
      options: {
        "A": "http://localhost:3001/public/images/a.png",
        "B": "http://localhost:3001/public/images/b.png",
        "C": "http://localhost:3001/public/images/c.png",
        "D": "http://localhost:3001/public/images/d.png"
      },
      correct_answer: "B",
      score: 1,
    },
    {
      type: 'benar-salah',
      question_text: "Seorang petani mencatat hasil panen padi dalam kilogram selama 6 bulan berturut-turut. Jika ingin mengetahui peningkatan hasil panen, maka data tersebut dapat disajikan dengan diagram garis.",
      options: ["Benar", "Salah"],
      correct_answer: "Benar",
      score: 2,
    },
    {
      type: "Isian Singkat",
      question_text: "Dengarkan audio berikut!\nSeorang siswa mencatat aktivitas belajar kelompoknya selama satu bulan:\nDiskusi: 6 jam\nPresentasi: 4 jam\nMenulis laporan: 5 jam\nTanya jawab: 5 jam\nJika data tersebut disajikan dalam diagram lingkaran, berapa sudut (dalam derajat) yang harus dibuat untuk setiap aktivitas secara berurutan?",
      correct_answer: "108, 72, 90, 90", 
      score: 3,
      audio_url: "http://localhost:3001/public/audio/misi3diagram.mp3",
    },
    {
      type: 'menjodohkan',
      question_text: "Petunjuk: Pasangkan nama diagram dengan contoh bentuk representasi diagram yang paling sesuai\nA. Seorang ilmuwan membandingkan suhu rata-rata di 6 kota berbeda di bulan Maret\nB. Seorang guru ingin menunjukkan perkembangan nilai matematika siswa selama 5 kali ulangan\nC. Data menunjukkan 5 jenis buah yang paling disukai siswa, lengkap dengan jumlah pemilih\nD. Seorang peneliti mengelompokkan data cuaca tiap hari: cerah, mendung, hujan, ekstrem",
      options: ["A", "B", "C", "D"],
      correct_answer: {
        "A": "Diagram Batang",
        "B": "Diagram Garis",
        "C": "Diagram Lingkaran",
        "D": "Diagram Batang" 
      },
      targets: [ 
        "Diagram Batang",
        "Diagram Garis",
        "Diagram Lingkaran",
        "Diagram Batang"
      ],
      score: 3,
    },
    {
      type: 'ya-tidak',
      question_text: "Diberikan data jumlah siswa yang mengikuti ekstrakurikuler di sekolah:\nEkstrakurikuler | Jumlah Siswa\nPramuka | 40\nBasket | 25\nMusik | 15\nSeorang guru ingin membuat diagram lingkaran untuk menyajikan data tersebut. Ia menghitung besar persentase untuk ekstrakurikuler Basket tersebut dengan rumus\n25 / 80 × 360° = 112.5°\nPernyataan: Perhitungan persentase untuk diagram lingkaran berdasarkan perintah soal sudah benar",
      options: ["Ya", "Tidak"],
      correct_answer: "Ya", 
      score: 3,
    },
    {
      type: "gambar-isian",
      question_text: "Sebuah kelas menyajikan data siswa berdasarkan jenis transportasi yang digunakan ke sekolah dalam bentuk diagram lingkaran seperti berikut:\nBesar sudut yang mewakili siswa naik sepeda adalah besar ...\nKetik jawabanmu hanya berupa angka",
      correct_answer: "90", 
      score: 4,
      image_url: "http://localhost:3001/public/images/piechart3.png",
    },
];

module.exports = mission6Question;