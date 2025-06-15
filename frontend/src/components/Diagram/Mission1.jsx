import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Target, Eye, EyeOff, Lightbulb } from 'lucide-react';

const DiagramCrosswordGame = ({ missionId, onComplete }) => {
  const [score, setScore] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [completedWords, setCompletedWords] = useState(new Set());
  const [hints, setHints] = useState({});
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Grid size based on the crossword image
  const gridSize = { rows: 12, cols: 12 };

  useEffect(() => {
    const fetchWords = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/question/${missionId}`);
        const data = await response.json();
        if (response.ok) {
          setWords(data);
        } else {
          setError(data.error || 'Gagal memuat data TTS');
        }
      } catch (_) {
        setError('Koneksi gagal. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWords();
  }, [missionId, API_URL]);

  // Initialize grid based on fetched words
  const [grid, setGrid] = useState(() => {
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
            correctLetter: word.word[i],
            isBlock: false,
            number: i === 0 ? word.number : existingNumber,
            wordIds: [...existingWordIds, word.id]
          };
        }
      }
    });

    return initialGrid;
  });

  const handleCellChange = (row, col, value) => {
    if (value.length > 1 || !/^[a-zA-Z]*$/.test(value)) return;

    const newGrid = [...grid];
    newGrid[row][col] = {
      ...newGrid[row][col],
      letter: value.toUpperCase()
    };
    setGrid(newGrid);
    checkWordCompletion(newGrid);
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
        totalScore += word.word.length * 2;
      }
    });

    setCompletedWords(newCompletedWords);
    setScore(totalScore);

    if (newCompletedWords.size === words.length) {
      setGameComplete(true);
      if (onComplete) {
        onComplete(totalScore, missionId);
      }
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
  };

  const toggleAnswers = () => {
    setShowAnswers(!showAnswers);
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
          break;
        }
      }
    }
  };

  const getCellClass = (row, col) => {
    const cell = grid[row][col];
    if (cell.isBlock) return 'bg-gray-900';

    let classes = 'bg-yellow-200 border border-gray-600 flex items-center justify-center relative text-black font-bold';

    const isPartOfCompletedWord = cell.wordIds?.some((id) => completedWords.has(id));
    if (isPartOfCompletedWord) {
      classes = 'bg-green-200 border border-gray-600 flex items-center justify-center relative text-black font-bold';
    }

    return classes;
  };

  const acrossClues = words.filter((word) => word.direction === 'across');
  const downClues = words.filter((word) => word.direction === 'down');

  if (isLoading) {
    return <div className="text-white text-center text-2xl">Memuat data TTS...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-400 text-2xl">
        {error}
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            fetchWords();
          }}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          aria-label="Coba lagi"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-orange-800 mb-2">MATERI DIAGRAM</h1>
          <p className="text-lg text-gray-600 mb-4">Teka-Teki Silang - Misi {missionId}</p>

          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
              <Target className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-orange-800">Skor: {score}</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
              <Trophy className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">
                Selesai: {completedWords.size}/{words.length}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={toggleAnswers}
              className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAnswers ? 'Sembunyikan' : 'Tampilkan'} Jawaban
            </button>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset TTS
            </button>
          </div>
        </div>

        {/* Game Complete Modal */}
        {gameComplete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Selamat!</h2>
              <p className="text-gray-600 mb-4">Anda berhasil menyelesaikan TTS dengan skor {score}!</p>
              <button
                onClick={resetGame}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Main Lagi
              </button>
            </div>
          </div>
        )}

        {/* Main Game Area */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Crossword Grid */}
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-8 h-8 text-sm font-bold ${getCellClass(rowIndex, colIndex)}`}
                    >
                      {!cell.isBlock && (
                        <>
                          {cell.number && (
                            <span className="absolute top-0 left-0.5 text-xs text-black font-bold">{cell.number}</span>
                          )}
                          <input
                            type="text"
                            value={showAnswers ? cell.correctLetter : cell.letter}
                            onChange={(e) => !showAnswers && handleCellChange(rowIndex, colIndex, e.target.value)}
                            className="w-full h-full text-center border-none outline-none bg-transparent font-bold text-black"
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
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-orange-800 mb-4 underline">Mendatar</h3>
              <div className="space-y-3">
                {acrossClues.map((word) => (
                  <div key={word.id} className="text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="font-bold text-orange-600">{word.number}. </span>
                        <span
                          className={completedWords.has(word.id) ? 'text-green-600 font-semibold' : 'text-gray-800'}
                        >
                          {word.clue}
                        </span>
                        {completedWords.has(word.id) && <span className="ml-2 text-green-500">✓</span>}
                      </div>
                      {!completedWords.has(word.id) && (
                        <button
                          onClick={() => showHint(word.id)}
                          className="text-yellow-600 hover:text-yellow-700 p-1"
                          title="Tampilkan petunjuk (-3 poin)"
                          disabled={hints[word.id]}
                        >
                          <Lightbulb className={`w-4 h-4 ${hints[word.id] ? 'text-gray-400' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-orange-800 mb-4 underline">Menurun</h3>
              <div className="space-y-3">
                {downClues.map((word) => (
                  <div key={word.id} className="text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="font-bold text-orange-600">{word.number}. </span>
                        <span
                          className={completedWords.has(word.id) ? 'text-green-600 font-semibold' : 'text-gray-800'}
                        >
                          {word.clue}
                        </span>
                        {completedWords.has(word.id) && <span className="ml-2 text-green-500">✓</span>}
                      </div>
                      {!completedWords.has(word.id) && (
                        <button
                          onClick={() => showHint(word.id)}
                          className="text-yellow-600 hover:text-yellow-700 p-1"
                          title="Tampilkan petunjuk (-3 poin)"
                          disabled={hints[word.id]}
                        >
                          <Lightbulb className={`w-4 h-4 ${hints[word.id] ? 'text-gray-400' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Cara Bermain:</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Klik kotak kuning untuk mengisi huruf</li>
                <li>• Setiap kata lengkap mendapat poin</li>
                <li>• Gunakan petunjuk 💡 jika kesulitan (-3 poin)</li>
                <li>• Kotak hijau menandakan kata sudah benar</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>TTS Edukatif - Materi Diagram dan Visualisasi Data</p>
        </div>
      </div>
    </div>
  );
};

export default DiagramCrosswordGame;