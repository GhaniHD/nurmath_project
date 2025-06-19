import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Target, Eye, EyeOff, Lightbulb, Mountain, Trees, Waves } from 'lucide-react';

// Hardcoded mission4Questions data for misi-4
const mission4Questions = [
  {
    type: 'crossword',
    question_text: 'Selesaikan teka-teki silang berikut untuk memahami konsep dasar grafik dan visualisasi data!',
    options: null,
    correct_answer: {
      'word-1': { word: 'TABEL', direction: 'across', startRow: 1, startCol: 5 },
      'word-2': { word: 'BATANG', direction: 'down', startRow: 1, startCol: 7 },
      'word-3': { word: 'LINGKARAN', direction: 'across', startRow: 4, startCol: 2 },
      'word-4': { word: 'PLOTLINE', direction: 'down', startRow: 3, startCol: 2 },
      'word-5': { word: 'DIAGRAM', direction: 'across', startRow: 8, startCol: 1 },
      'word-6': { word: 'GARIS', direction: 'down', startRow: 3, startCol: 9 },
    },
    score: 36,
    audio_url: null,
    image_url: null,
    targets: [
      {
        id: 'word-1',
        number: 1,
        clue: 'Penyajian data dalam bentuk kolom dan baris ',
        direction: 'across',
        startRow: 1,
        startCol: 5,
        word: 'TABEL',
        score: 6,
      },
      {
        id: 'word-2',
        number: 2,
        clue: 'Diagram yang cocok untuk membandingkan jumlah antar kategori ',
        direction: 'down',
        startRow: 1,
        startCol: 7,
        word: 'BATANG',
        score: 8,
      },
      {
        id: 'word-3',
        number: 3,
        clue: 'Diagram yang menunjukkan bagian-bagian dari keseluruhan dalam bentuk proporsi ',
        direction: 'across',
        startRow: 4,
        startCol: 2,
        word: 'LINGKARAN',
        score: 6,
      },
      {
        id: 'word-4',
        number: 4,
        clue: 'Penyajian data berupa titik-titik atau bertanda x yang terhubung mengikuti data ',
        direction: 'down',
        startRow: 3,
        startCol: 2,
        word: 'PLOTLINE',
        score: 8,
      },
      {
        id: 'word-5',
        number: 5,
        clue: 'Gambar atau visual yang digunakan untuk menyampaikan informasi data secara ringkas dan jelas ',
        direction: 'across',
        startRow: 8,
        startCol: 1,
        word: 'DIAGRAM',
        score: 8,
      },
      {
        id: 'word-6',
        number: 6,
        clue: 'Diagram yang menunjukkan perubahan nilai dengan cara menghubungkan titik-titik ',
        direction: 'down',
        startRow: 3,
        startCol: 9,
        word: 'GARIS',
        score: 8,
      },
    ],
  },
];

const DiagramCrosswordGame = ({ missionId = 'misi-4', onComplete }) => {
  const [score, setScore] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [completedWords, setCompletedWords] = useState(new Set());
  const [hints, setHints] = useState({});
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [particles, setParticles] = useState([]);
  const [characterAnimation, setCharacterAnimation] = useState('idle'); // State for character animation

  // Grid size based on the crossword data
  const gridSize = { rows: 12, cols: 12 };

  // Initialize grid with a default value
  const [grid, setGrid] = useState(() =>
    Array(gridSize.rows)
      .fill(null)
      .map(() =>
        Array(gridSize.cols).fill({ letter: '', isBlock: true, number: null, wordIds: [], correctLetter: '' })
      )
  );

  // Create floating particles for background animation
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: (particle.y + particle.speed) % 100,
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    try {
      if (missionId === 'misi-4') {
        setWords(mission4Questions[0].targets);
      } else {
        setError('Misi tidak ditemukan.');
      }
    } catch (_) {
      setError('Gagal memuat data TTS.');
    } finally {
      setIsLoading(false);
    }
  }, [missionId]);

  useEffect(() => {
    if (words.length > 0) {
      const initialGrid = Array(gridSize.rows)
        .fill(null)
        .map(() =>
          Array(gridSize.cols).fill({ letter: '', isBlock: true, number: null, wordIds: [], correctLetter: '' })
        );

      words.forEach((word) => {
        for (let i = 0; i < word.word.length; i++) {
          const row = word.direction === 'across' ? word.startRow : word.startRow + i;
          const col = word.direction === 'across' ? word.startCol + i : word.startCol;

          if (row < gridSize.rows && col < gridSize.cols) {
            const existingWordIds = initialGrid[row][col].wordIds || [];
            const existingNumber = initialGrid[row][col].number;

            initialGrid[row][col] = {
              letter: '',
              correctLetter: word.word[i].toUpperCase(),
              isBlock: false,
              number: i === 0 ? word.number : existingNumber,
              wordIds: [...existingWordIds, word.id]
            };
          }
        }
      });

      setGrid(initialGrid);
    }
  }, [words]);

  const handleCellChange = (row, col, value) => {
    if (value.length > 1 || !/^[a-zA-Z]*$/.test(value)) return;

    const newGrid = [...grid];
    newGrid[row][col] = {
      ...newGrid[row][col],
      letter: value.toUpperCase()
    };
    setGrid(newGrid);
    checkWordCompletion(newGrid);
    setCharacterAnimation('active'); // Trigger character animation on input
    setTimeout(() => setCharacterAnimation('idle'), 1000); // Reset after 1 second
  };

  const checkWordCompletion = (currentGrid) => {
    const newCompletedWords = new Set();
    let totalScore = 0;

    words.forEach((word) => {
      let isComplete = true;
      let isCorrect = true;

      for (let i = 0; i < word.word.length; i++) {
        const row = word.direction === 'across' ? word.startRow : word.startRow + i;
        const col = word.direction === 'across' ? word.startCol + i : word.startCol;

        if (row < gridSize.rows && col < gridSize.cols) {
          const cell = currentGrid[row][col];
          if (!cell.letter) {
            isComplete = false;
            break;
          }
          if (cell.letter !== cell.correctLetter) {
            isCorrect = false;
          }
        }
      }

      if (isComplete && isCorrect) {
        newCompletedWords.add(word.id);
        totalScore += word.score;
      }
    });

    setCompletedWords(newCompletedWords);
    setScore(totalScore);

    if (newCompletedWords.size === words.length) {
      setGameComplete(true);
      if (onComplete) {
        onComplete(totalScore, missionId);
      }
      setCharacterAnimation('celebrate'); // Trigger celebration animation
    }
  };

  const resetGame = () => {
    const newGrid = [...grid];
    newGrid.forEach((row) => {
      row.forEach((cell) => {
        if (!cell.isBlock) {
          cell.letter = '';
        }
      });
    });
    setGrid(newGrid);
    setScore(0);
    setCompletedWords(new Set());
    setGameComplete(false);
    setHints({});
    setCharacterAnimation('idle'); // Reset character animation
  };

  const toggleAnswers = () => {
    setShowAnswers(!showAnswers);
    setCharacterAnimation(showAnswers ? 'idle' : 'active'); // Trigger animation on toggle
    setTimeout(() => setCharacterAnimation('idle'), 1000);
  };

  const showHint = (wordId) => {
    const word = words.find((w) => w.id === wordId);
    if (!word || hints[wordId]) return;

    for (let i = 0; i < word.word.length; i++) {
      const row = word.direction === 'across' ? word.startRow : word.startRow + i;
      const col = word.direction === 'across' ? word.startCol + i : word.startCol;

      if (row < gridSize.rows && col < gridSize.cols) {
        const cell = grid[row][col];
        if (!cell.letter) {
          const newGrid = [...grid];
          newGrid[row][col] = {
            ...newGrid[row][col],
            letter: cell.correctLetter
          };
          setGrid(newGrid);
          setHints((prev) => ({ ...prev, [wordId]: true }));
          setScore(Math.max(0, score - 3));
          checkWordCompletion(newGrid);
          setCharacterAnimation('hint'); // Trigger hint animation
          setTimeout(() => setCharacterAnimation('idle'), 1000);
          break;
        }
      }
    }
  };

  const getCellClass = (row, col) => {
    const cell = grid[row][col];
    if (cell.isBlock) return 'bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-700 shadow-inner';

    let classes = 'bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-400 flex items-center justify-center relative text-amber-900 font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-amber-500 hover:from-yellow-100 hover:to-amber-200';

    const isPartOfCompletedWord = cell.wordIds?.some((id) => completedWords.has(id));
    if (isPartOfCompletedWord) {
      classes = 'bg-gradient-to-br from-green-200 via-emerald-300 to-green-400 border-2 border-green-500 flex items-center justify-center relative text-green-900 font-bold transition-all duration-500 animate-pulse shadow-lg transform scale-105';
    }

    return classes;
  };

  const acrossClues = words.filter((word) => word.direction === 'across');
  const downClues = words.filter((word) => word.direction === 'down');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 via-yellow-200 to-orange-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-600 border-t-transparent mx-auto mb-4"></div>
          <div className="text-amber-800 text-2xl font-bold animate-bounce">Memuat Petualangan TTS...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-orange-200 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
          <div className="text-red-600 text-2xl mb-4">{error}</div>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
            aria-label="Coba lagi"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!grid || grid.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
        <div className="text-center text-red-600 text-2xl bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
          Gagal menginisialisasi grid.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-100 to-orange-200 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-amber-300/20 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>

      {/* Decorative Mountains */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-200/30 to-transparent">
        <Mountain className="absolute top-4 left-10 w-8 h-8 text-amber-600/40 animate-bounce" style={{ animationDelay: '0s' }} />
        <Trees className="absolute top-6 right-20 w-6 h-6 text-green-600/40 animate-bounce" style={{ animationDelay: '1s' }} />
        <Waves className="absolute top-8 left-1/2 w-7 h-7 text-blue-600/40 animate-bounce" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 transform hover:scale-105 transition-transform duration-300">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-800 via-yellow-700 to-orange-800 bg-clip-text text-transparent mb-4 animate-pulse drop-shadow-lg">
            🏔️ PETUALANGAN DIAGRAM 🌲
          </h1>
          <p className="text-2xl text-amber-700 mb-4 font-semibold">Teka-Teki Silang Daratan - Misi {missionId}</p>
          <p className="text-lg text-amber-600 italic bg-white/50 backdrop-blur-sm p-4 rounded-2xl shadow-lg max-w-4xl mx-auto border border-amber-300">
            {mission4Questions[0].question_text}
          </p>

          <div className="flex justify-center items-center gap-6 mb-6 mt-6">
            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-100 to-yellow-200 px-6 py-3 rounded-2xl shadow-lg border border-amber-300 transform hover:scale-110 transition-all duration-300">
              <Target className="w-6 h-6 text-amber-700 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="font-bold text-amber-800 text-lg">Skor: {score}</span>
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-200 px-6 py-3 rounded-2xl shadow-lg border border-green-300 transform hover:scale-110 transition-all duration-300">
              <Trophy className="w-6 h-6 text-green-700 animate-bounce" />
              <span className="font-bold text-green-800 text-lg">
                Selesai: {completedWords.size}/{words.length}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={toggleAnswers}
              className="flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 py-3 rounded-2xl hover:from-yellow-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              {showAnswers ? <EyeOff className="w-5 h-5 animate-pulse" /> : <Eye className="w-5 h-5 animate-pulse" />}
              {showAnswers ? 'Sembunyikan' : 'Tampilkan'} Jawaban
            </button>
            <button
              onClick={resetGame}
              className="flex items-center gap-3 bg-gradient-to-r from-gray-500 to-slate-600 text-white px-6 py-3 rounded-2xl hover:from-gray-600 hover:to-slate-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              <RotateCcw className="w-5 h-5 animate-spin" style={{ animationDuration: '2s' }} />
              Reset TTS
            </button>
          </div>
        </div>
        {/* Interactive Character Above TTS Box */}
      <div className="text-center mt-8 -mb-20 z-20">
        <img
          src="images/misi-1.png"
          alt="Forest Explorer Character"
          className={`w-64 h-64 rounded-lg object-cover transition-all duration-300 ${characterAnimation === 'idle' ? 'animate-bounce' : ''} ${characterAnimation === 'active' ? 'animate-wiggle' : ''} ${characterAnimation === 'celebrate' ? 'animate-spin' : ''} ${characterAnimation === 'hint' ? 'animate-pulse' : ''}`}
          onMouseEnter={() => setCharacterAnimation('active')}
          onMouseLeave={() => setCharacterAnimation('idle')}
          onClick={() => setCharacterAnimation('celebrate')}
        />
      </div>

        {/* Game Complete Modal */}
        {gameComplete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-yellow-100 to-amber-200 p-10 rounded-3xl shadow-2xl text-center max-w-md transform animate-bounce border-4 border-yellow-400">
              <Trophy className="w-20 h-20 text-yellow-600 mx-auto mb-6 animate-spin" style={{ animationDuration: '2s' }} />
              <h2 className="text-3xl font-bold text-amber-800 mb-4">🎉 Fantastis! 🎉</h2>
              <p className="text-amber-700 mb-6 text-lg">Anda berhasil menaklukkan TTS Daratan dengan skor <span className="font-bold text-2xl text-green-600">{score}</span>!</p>
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-110 shadow-lg font-bold text-lg"
              >
                🔄 Petualangan Baru
              </button>
            </div>
          </div>
        )}


        {/* Main Game Area */}
        <div className="grid xl:grid-cols-2 gap-10">
          {/* Crossword Grid */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-white/90 to-amber-50/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-amber-300 transform hover:scale-102 transition-all duration-500">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-10 h-10 text-sm font-bold rounded-lg ${getCellClass(rowIndex, colIndex)}`}
                    >
                      {!cell.isBlock && (
                        <>
                          {cell.number && (
                            <span className="absolute top-0.5 left-1 text-xs text-amber-700 font-bold bg-white/70 rounded px-1">
                              {cell.number}
                            </span>
                          )}
                          <input
                            type="text"
                            value={showAnswers ? cell.correctLetter : cell.letter}
                            onChange={(e) => !showAnswers && handleCellChange(rowIndex, colIndex, e.target.value)}
                            className="w-full h-full text-center border-none outline-none bg-transparent font-bold text-inherit rounded-lg focus:ring-2 focus:ring-amber-400 transition-all duration-300"
                            maxLength="1"
                            disabled={showAnswers}
                            style={{ backgroundColor: 'transparent' }}
                            aria-label={`Input huruf untuk kotak ${rowIndex + 1},${colIndex + 1}`}
                          />
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          

          {/* Clues */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-white/90 to-amber-50/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border-2 border-amber-300 transform hover:scale-102 transition-all duration-500">
              <h3 className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-3">
                <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full">→</span>
                Mendatar
              </h3>
              <div className="space-y-4">
                {acrossClues.map((word) => (
                  <div key={word.id} className="text-sm bg-white/50 p-4 rounded-2xl border border-amber-200 hover:bg-white/70 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className="font-bold text-amber-700 text-lg">{word.number}. </span>
                        <span
                          className={completedWords.has(word.id) ? 'text-green-700 font-bold' : 'text-amber-800'}
                        >
                          {word.clue}
                        </span>
                        {completedWords.has(word.id) && <span className="ml-2 text-green-500 text-xl animate-bounce">✅</span>}
                      </div>
                      {!completedWords.has(word.id) && (
                        <button
                          onClick={() => showHint(word.id)}
                          className="text-yellow-600 hover:text-yellow-700 p-2 rounded-full hover:bg-yellow-100 transition-all duration-300 transform hover:scale-110"
                          title="Tampilkan petunjuk (-3 poin)"
                          disabled={hints[word.id]}
                        >
                          <Lightbulb className={`w-5 h-5 ${hints[word.id] ? 'text-gray-400' : 'animate-pulse'}`} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/90 to-amber-50/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border-2 border-amber-300 transform hover:scale-102 transition-all duration-500">
              <h3 className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-3">
                <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full">↓</span>
                Menurun
              </h3>
              <div className="space-y-4">
                {downClues.map((word) => (
                  <div key={word.id} className="text-sm bg-white/50 p-4 rounded-2xl border border-amber-200 hover:bg-white/70 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className="font-bold text-amber-700 text-lg">{word.number}. </span>
                        <span
                          className={completedWords.has(word.id) ? 'text-green-700 font-bold' : 'text-amber-800'}
                        >
                          {word.clue}
                        </span>
                        {completedWords.has(word.id) && <span className="ml-2 text-green-500 text-xl animate-bounce">✅</span>}
                      </div>
                      {!completedWords.has(word.id) && (
                        <button
                          onClick={() => showHint(word.id)}
                          className="text-yellow-600 hover:text-yellow-700 p-2 rounded-full hover:bg-yellow-100 transition-all duration-300 transform hover:scale-110"
                          title="Tampilkan petunjuk (-3 poin)"
                          disabled={hints[word.id]}
                        >
                          <Lightbulb className={`w-5 h-5 ${hints[word.id] ? 'text-gray-400' : 'animate-pulse'}`} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            

            <div className="bg-gradient-to-br from-orange-100 to-amber-200 p-6 rounded-3xl border-2 border-orange-300 shadow-lg transform hover:scale-105 transition-all duration-300">
              <h4 className="font-bold text-orange-800 mb-4 text-xl flex items-center gap-2">
                🎯 Panduan Petualangan:
              </h4>
              <ul className="text-sm text-orange-700 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  Klik kotak kuning untuk mengisi huruf
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  Setiap kata lengkap mendapat poin sesuai skor
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  Gunakan petunjuk 💡 jika kesulitan (-3 poin)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  Kotak hijau menandakan kata sudah benar
                </li>
              </ul>
            </div>
          </div>
        </div>


        <div className="text-center mt-4 text-amber-600 bg-white/30 backdrop-blur-sm p-4 rounded-2xl border border-amber-200">
          <p className="text-lg font-semibold">🏔️ TTS Petualangan Daratan - Materi Diagram dan Visualisasi Data 🌲</p>
          <p className="text-sm mt-2 opacity-75">Jelajahi dunia pengetahuan dengan tema alam yang menawan!</p>
        </div>
      </div>

      {/* CSS Animations for Character */}
      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(5deg); }
            75% { transform: rotate(-5deg); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .animate-bounce { animation: bounce 1s infinite; }
          .animate-wiggle { animation: wiggle 0.5s ease-in-out; }
          .animate-spin { animation: spin 1s ease-out; }
          .animate-pulse { animation: pulse 1s infinite; }
        `}
      </style>
    </div>
  );
};

export default DiagramCrosswordGame;