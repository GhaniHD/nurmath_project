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
      { id: 'word-1', number: 1, clue: 'Penyajian data dalam bentuk kolom dan baris ', direction: 'across', startRow: 1, startCol: 5, word: 'TABEL', score: 6 },
      { id: 'word-2', number: 2, clue: 'Diagram yang cocok untuk membandingkan jumlah antar kategori ', direction: 'down', startRow: 1, startCol: 7, word: 'BATANG', score: 8 },
      { id: 'word-3', number: 3, clue: 'Diagram yang menunjukkan bagian-bagian dari keseluruhan dalam bentuk proporsi ', direction: 'across', startRow: 4, startCol: 2, word: 'LINGKARAN', score: 6 },
      { id: 'word-4', number: 4, clue: 'Penyajian data berupa titik-titik atau bertanda x yang terhubung mengikuti data ', direction: 'down', startRow: 3, startCol: 2, word: 'PLOTLINE', score: 8 },
      { id: 'word-5', number: 5, clue: 'Gambar atau visual yang digunakan untuk menyampaikan informasi data secara ringkas dan jelas ', direction: 'across', startRow: 8, startCol: 1, word: 'DIAGRAM', score: 8 },
      { id: 'word-6', number: 6, clue: 'Diagram yang menunjukkan perubahan nilai dengan cara menghubungkan titik-titik ', direction: 'down', startRow: 3, startCol: 9, word: 'GARIS', score: 8 },
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
  const [characterAnimation, setCharacterAnimation] = useState('idle');

  const gridSize = { rows: 12, cols: 12 };

  const [grid, setGrid] = useState(() =>
    Array(gridSize.rows)
      .fill(null)
      .map(() =>
        Array(gridSize.cols).fill({ letter: '', isBlock: true, number: null, wordIds: [], correctLetter: '' })
      )
  );

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
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          y: (particle.y + particle.speed) % 100,
        }))
      );
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
              wordIds: [...existingWordIds, word.id],
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
      letter: value.toUpperCase(),
    };
    setGrid(newGrid);
    checkWordCompletion(newGrid);
    setCharacterAnimation('active');
    setTimeout(() => setCharacterAnimation('idle'), 1000);
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
      setCharacterAnimation('celebrate');
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
    setCharacterAnimation('idle');
  };

  const toggleAnswers = () => {
    setShowAnswers(!showAnswers);
    setCharacterAnimation(showAnswers ? 'idle' : 'active');
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
            letter: cell.correctLetter,
          };
          setGrid(newGrid);
          setHints((prev) => ({ ...prev, [wordId]: true }));
          setScore(Math.max(0, score - 3));
          checkWordCompletion(newGrid);
          setCharacterAnimation('hint');
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-100 via-yellow-200 to-orange-300">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 border-4 rounded-full animate-spin border-amber-600 border-t-transparent sm:w-16 sm:h-16"></div>
          <div className="text-xl font-bold text-amber-800 animate-bounce sm:text-2xl">Memuat Petualangan TTS...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-100 to-orange-200">
        <div className="p-4 text-center shadow-xl bg-white/80 backdrop-blur-sm rounded-xl sm:p-6">
          <div className="mb-2 text-lg text-red-600 sm:text-xl">{error}</div>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
            }}
            className="px-4 py-2 text-white transition-all duration-300 transform shadow-md bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:from-red-600 hover:to-orange-600 sm:px-6 sm:py-3"
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-100 to-orange-200">
        <div className="p-4 text-lg text-center text-red-600 shadow-xl bg-white/80 backdrop-blur-sm rounded-xl sm:p-6 sm:text-xl">
          Gagal menginisialisasi grid.
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-100 to-orange-200">
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

      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-amber-200/30 to-transparent">
        <Mountain className="absolute w-6 h-6 top-2 left-4 text-amber-600/40 animate-bounce sm:w-8 sm:h-8" style={{ animationDelay: '0s' }} />
        <Trees className="absolute w-4 h-4 top-3 right-6 text-green-600/40 animate-bounce sm:w-6 sm:h-6 sm:right-12" style={{ animationDelay: '1s' }} />
        <Waves className="absolute top-4 left-1/2 w-5 h-5 text-blue-600/40 animate-bounce sm:w-7 sm:h-7" style={{ animationDelay: '2s' }} />
      </div>

      <div className="fixed z-20 top-2 left-2 sm:top-4 sm:left-4">
        <button
          onClick={() => (window.location.href = '/diagram')}
          className="group relative px-2 py-1 bg-gradient-to-r from-amber-600/80 to-orange-700/80 rounded text-amber-200 font-semibold text-xs shadow-md hover:-translate-y-0.5 transition-all duration-300 sm:px-4 sm:py-2 sm:text-sm"
        >
          <span className="relative z-10">← Kembali</span>
          <div className="absolute inset-0 transition-opacity duration-300 rounded opacity-0 bg-amber-500/30 group-hover:opacity-100" />
        </button>
      </div>

      <div className="relative z-10 p-2 mx-auto max-w-7xl sm:p-4">
        <div className="mb-4 text-center transition-transform duration-300 hover:scale-105 sm:mb-6">
          <h1 className="mb-2 text-3xl font-bold text-transparent bg-gradient-to-r from-amber-800 via-yellow-700 to-orange-800 bg-clip-text animate-pulse drop-shadow-lg sm:text-5xl">
            🏔️ PETUALANGAN DIAGRAM 🌲
          </h1>
          <p className="mb-2 text-lg font-semibold text-amber-700 sm:text-xl">Teka-Teki Silang Daratan - Misi {missionId}</p>
          <p className="max-w-3xl p-2 mx-auto text-sm italic border shadow-md text-amber-600 bg-white/50 backdrop-blur-sm rounded-lg border-amber-300 sm:p-3 sm:text-base sm:max-w-4xl">
            {mission4Questions[0].question_text}
          </p>

          <div className="flex flex-col items-center gap-4 mt-4 mb-4 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2 px-3 py-2 border shadow-md bg-gradient-to-r from-amber-100 to-yellow-200 rounded-lg border-amber-300 sm:px-4 sm:py-2">
              <Target className="w-4 h-4 text-amber-700 animate-spin sm:w-6 sm:h-6" style={{ animationDuration: '3s' }} />
              <span className="text-sm font-bold text-amber-800 sm:text-lg">Skor: {score}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border border-green-300 shadow-md bg-gradient-to-r from-green-100 to-emerald-200 rounded-lg sm:px-4 sm:py-2">
              <Trophy className="w-4 h-4 text-green-700 animate-bounce sm:w-6 sm:h-6" />
              <span className="text-sm font-bold text-green-800 sm:text-lg">
                Selesai: {completedWords.size}/{words.length}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <button
              onClick={toggleAnswers}
              className="flex items-center gap-2 px-3 py-2 font-semibold text-white transition-all duration-300 shadow-md bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg hover:from-yellow-600 hover:to-amber-700 sm:px-4 sm:py-2"
            >
              {showAnswers ? <EyeOff className="w-4 h-4 animate-pulse sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 animate-pulse sm:w-5 sm:h-5" />}
              {showAnswers ? 'Sembunyikan' : 'Tampilkan'} Jawaban
            </button>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-3 py-2 font-semibold text-white transition-all duration-300 shadow-md bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg hover:from-gray-600 hover:to-slate-700 sm:px-4 sm:py-2"
            >
              <RotateCcw className="w-4 h-4 animate-spin sm:w-5 sm:h-5" style={{ animationDuration: '2s' }} />
              Reset TTS
            </button>
          </div>
        </div>

        <div className="mt-4 -mb-16 text-center sm:mt-6 sm:-mb-20">
          <img
            src="/images/misi-1.png"
            alt="Forest Explorer Character"
            className={`w-32 h-32 rounded-lg object-cover transition-all duration-300 ${characterAnimation === 'idle' ? 'animate-bounce' : ''} ${characterAnimation === 'active' ? 'animate-wiggle' : ''} ${characterAnimation === 'celebrate' ? 'animate-spin' : ''} ${characterAnimation === 'hint' ? 'animate-pulse' : ''} sm:w-64 sm:h-64`}
            onMouseEnter={() => setCharacterAnimation('active')}
            onMouseLeave={() => setCharacterAnimation('idle')}
            onClick={() => setCharacterAnimation('celebrate')}
          />
        </div>

        {gameComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="max-w-xs p-4 text-center border-2 border-yellow-400 shadow-xl bg-gradient-to-br from-yellow-100 to-amber-200 rounded-xl animate-bounce sm:max-w-md sm:p-6 sm:rounded-2xl">
              <Trophy className="w-12 h-12 mx-auto mb-2 text-yellow-600 animate-spin sm:w-20 sm:h-20" style={{ animationDuration: '2s' }} />
              <h2 className="mb-2 text-xl font-bold text-amber-800 sm:text-3xl">🎉 Fantastis! 🎉</h2>
              <p className="mb-2 text-sm text-amber-700 sm:text-lg">Anda berhasil menaklukkan TTS Daratan dengan skor <span className="text-base font-bold text-green-600 sm:text-2xl">{score}</span>!</p>
              <button
                onClick={resetGame}
                className="px-4 py-2 text-sm font-bold text-white transition-all duration-300 shadow-md bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:from-orange-600 hover:to-red-600 sm:px-6 sm:py-3 sm:text-lg"
              >
                🔄 Petualangan Baru
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 mt-4 xl:grid-cols-2">
          <div className="flex justify-center">
            <div className="p-2 border-2 shadow-md bg-gradient-to-br from-white/90 to-amber-50/90 backdrop-blur-sm rounded-xl border-amber-300 sm:p-4">
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${gridSize.rows}, minmax(0, 1fr))`,
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-6 h-6 text-xs font-bold rounded ${getCellClass(rowIndex, colIndex)} sm:w-10 sm:h-10 sm:text-sm`}
                    >
                      {!cell.isBlock && (
                        <>
                          {cell.number && (
                            <span className="absolute top-0.5 left-0.5 text-[8px] text-amber-700 font-bold bg-white/70 rounded px-0.5 sm:text-xs sm:top-1 sm:left-1">
                              {cell.number}
                            </span>
                          )}
                          <input
                            type="text"
                            value={showAnswers ? cell.correctLetter : cell.letter}
                            onChange={(e) => !showAnswers && handleCellChange(rowIndex, colIndex, e.target.value)}
                            className="w-full h-full font-bold text-center bg-transparent border-none rounded outline-none text-inherit focus:ring-2 focus:ring-amber-400 sm:focus:ring-4"
                            maxLength="1"
                            disabled={showAnswers}
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

          <div className="space-y-4">
            <div className="p-2 border-2 shadow-md bg-gradient-to-br from-white/90 to-amber-50/90 backdrop-blur-sm rounded-xl border-amber-300 sm:p-4">
              <h3 className="flex items-center gap-2 mb-2 text-lg font-bold text-amber-800 sm:text-2xl">
                <span className="px-1 py-0.5 text-white rounded bg-gradient-to-r from-amber-500 to-yellow-500 text-xs sm:text-sm">→</span>
                Mendatar
              </h3>
              <div className="space-y-2">
                {acrossClues.map((word) => (
                  <div key={word.id} className="p-2 text-xs border bg-white/50 rounded border-amber-200 hover:bg-white/70 sm:p-4 sm:text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="text-base font-bold text-amber-700 sm:text-lg">{word.number}. </span>
                        <span
                          className={completedWords.has(word.id) ? 'text-green-700 font-bold' : 'text-amber-800'}
                        >
                          {word.clue}
                        </span>
                        {completedWords.has(word.id) && <span className="ml-1 text-lg text-green-500 animate-bounce sm:text-xl">✅</span>}
                      </div>
                      {!completedWords.has(word.id) && (
                        <button
                          onClick={() => showHint(word.id)}
                          className="p-1 text-yellow-600 rounded-full hover:text-yellow-700 hover:bg-yellow-100 sm:p-2"
                          title="Tampilkan petunjuk (-3 poin)"
                          disabled={hints[word.id]}
                        >
                          <Lightbulb className={`w-3 h-3 ${hints[word.id] ? 'text-gray-400' : 'animate-pulse'} sm:w-5 sm:h-5`} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2 border-2 shadow-md bg-gradient-to-br from-white/90 to-amber-50/90 backdrop-blur-sm rounded-xl border-amber-300 sm:p-4">
              <h3 className="flex items-center gap-2 mb-2 text-lg font-bold text-amber-800 sm:text-2xl">
                <span className="px-1 py-0.5 text-white rounded bg-gradient-to-r from-amber-500 to-yellow-500 text-xs sm:text-sm">↓</span>
                Menurun
              </h3>
              <div className="space-y-2">
                {downClues.map((word) => (
                  <div key={word.id} className="p-2 text-xs border bg-white/50 rounded border-amber-200 hover:bg-white/70 sm:p-4 sm:text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="text-base font-bold text-amber-700 sm:text-lg">{word.number}. </span>
                        <span
                          className={completedWords.has(word.id) ? 'text-green-700 font-bold' : 'text-amber-800'}
                        >
                          {word.clue}
                        </span>
                        {completedWords.has(word.id) && <span className="ml-1 text-lg text-green-500 animate-bounce sm:text-xl">✅</span>}
                      </div>
                      {!completedWords.has(word.id) && (
                        <button
                          onClick={() => showHint(word.id)}
                          className="p-1 text-yellow-600 rounded-full hover:text-yellow-700 hover:bg-yellow-100 sm:p-2"
                          title="Tampilkan petunjuk (-3 poin)"
                          disabled={hints[word.id]}
                        >
                          <Lightbulb className={`w-3 h-3 ${hints[word.id] ? 'text-gray-400' : 'animate-pulse'} sm:w-5 sm:h-5`} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2 border-2 border-orange-300 shadow-md bg-gradient-to-br from-orange-100 to-amber-200 rounded-xl sm:p-4">
              <h4 className="flex items-center gap-1 mb-1 text-base font-bold text-orange-800 sm:text-xl">
                🎯 Panduan Petualangan:
              </h4>
              <ul className="space-y-1 text-xs text-orange-700 sm:text-sm">
                <li className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-orange-500 rounded-full animate-pulse"></span>
                  Klik kotak kuning untuk mengisi huruf
                </li>
                <li className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-orange-500 rounded-full animate-pulse"></span>
                  Setiap kata lengkap mendapat poin sesuai skor
                </li>
                <li className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-orange-500 rounded-full animate-pulse"></span>
                  Gunakan petunjuk 💡 jika kesulitan (-3 poin)
                </li>
                <li className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-orange-500 rounded-full animate-pulse"></span>
                  Kotak hijau menandakan kata sudah benar
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-2 mt-2 text-center border text-amber-600 bg-white/30 backdrop-blur-sm rounded-lg border-amber-200 sm:p-3 sm:mt-4">
          <p className="text-sm font-semibold sm:text-lg">🏔️ TTS Petualangan Daratan - Materi Diagram dan Visualisasi Data 🌲</p>
          <p className="mt-1 text-xs opacity-75 sm:text-sm">Jelajahi dunia pengetahuan dengan tema alam yang menawan!</p>
        </div>
      </div>

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