const mission4Questions = [
  {
    type: 'crossword',
    question_text: 'Selesaikan teka-teki silang berikut untuk memahami konsep dasar grafik dan visualisasi data!',
    grid_size: { rows: 12, cols: 12 },
    words: [
      {
        id: 'word-1',
        number: 1,
        word: 'BAR',
        clue: 'Jenis grafik yang menggunakan batang untuk menunjukkan data',
        direction: 'across',
        startRow: 2,
        startCol: 3,
        score: 6 // 3 letters * 2 points
      },
      {
        id: 'word-2',
        number: 2,
        word: 'LINE',
        clue: 'Grafik yang menghubungkan titik-titik untuk menunjukkan tren',
        direction: 'down',
        startRow: 1,
        startCol: 5,
        score: 8 // 4 letters * 2 points
      },
      {
        id: 'word-3',
        number: 3,
        word: 'PIE',
        clue: 'Grafik lingkaran untuk menunjukkan proporsi',
        direction: 'across',
        startRow: 5,
        startCol: 2,
        score: 6 // 3 letters * 2 points
      },
      {
        id: 'word-4',
        number: 4,
        word: 'AXIS',
        clue: 'Sumbu pada grafik untuk menunjukkan skala',
        direction: 'down',
        startRow: 3,
        startCol: 7,
        score: 8 // 4 letters * 2 points
      },
      {
        id: 'word-5',
        number: 5,
        word: 'DATA',
        clue: 'Informasi yang divisualisasikan dalam grafik',
        direction: 'across',
        startRow: 7,
        startCol: 4,
        score: 8 // 4 letters * 2 points
      }
    ],
    total_score: 36 // Sum of individual word scores
  }
];

module.exports = mission4Questions;