const mission4Questions = [
  {
    type: 'crossword',
    question_text: 'Selesaikan teka-teki silang berikut untuk memahami konsep dasar grafik dan visualisasi data!',
    options: null, // No options for crossword, as answers are entered in the grid
    correct_answer: {
      'word-1': { word: 'BAR', direction: 'across', startRow: 2, startCol: 3 },
      'word-2': { word: 'LINE', direction: 'down', startRow: 1, startCol: 5 },
      'word-3': { word: 'PIE', direction: 'across', startRow: 5, startCol: 2 },
      'word-4': { word: 'AXIS', direction: 'down', startRow: 3, startCol: 7 },
      'word-5': { word: 'DATA', direction: 'across', startRow: 7, startCol: 4 },
    },
    score: 36, // Total score from all words
    audio_url: null,
    image_url: null,
    targets: [
      {
        id: 'word-1',
        number: 1,
        clue: 'Jenis grafik yang menggunakan batang untuk menunjukkan data',
        direction: 'across',
        startRow: 2,
        startCol: 3,
        word: 'BAR',
        score: 6, // 3 letters * 2 points
      },
      {
        id: 'word-2',
        number: 2,
        clue: 'Grafik yang menghubungkan titik-titik untuk menunjukkan tren',
        direction: 'down',
        startRow: 1,
        startCol: 5,
        word: 'LINE',
        score: 8, // 4 letters * 2 points
      },
      {
        id: 'word-3',
        number: 3,
        clue: 'Grafik lingkaran untuk menunjukkan proporsi',
        direction: 'across',
        startRow: 5,
        startCol: 2,
        word: 'PIE',
        score: 6, // 3 letters * 2 points
      },
      {
        id: 'word-4',
        number: 4,
        clue: 'Sumbu pada grafik untuk menunjukkan skala',
        direction: 'down',
        startRow: 3,
        startCol: 7,
        word: 'AXIS',
        score: 8, // 4 letters * 2 points
      },
      {
        id: 'word-5',
        number: 5,
        clue: 'Informasi yang divisualisasikan dalam grafik',
        direction: 'across',
        startRow: 7,
        startCol: 4,
        word: 'DATA',
        score: 8, // 4 letters * 2 points
      },
    ],
  },
];

module.exports = mission4Questions;