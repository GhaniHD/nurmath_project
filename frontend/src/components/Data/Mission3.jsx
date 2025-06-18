import { useState, useEffect } from 'react';

const Mission3 = ({ missionId, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [result, setResult] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storyPhase, setStoryPhase] = useState('intro');

  const navigate = null; // Demo mode - navigation disabled
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/questions/${missionId}`);
        const data = await response.json();
        if (response.ok) {
          setQuestions(data.map((q, index) => ({ ...q, id: index + 1, answered: false, correct: null })));
        } else {
          setError(data.error || 'Gagal memuat soal');
        }
      } catch (_) {
        setError('Koneksi gagal. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
        // Auto-transition to quiz after intro
        setTimeout(() => setStoryPhase('quiz'), 5000);
      }
    };
    fetchQuestions();
  }, [missionId, API_URL]);

  // Check if all questions are answered
  useEffect(() => {
    if (questions.length > 0) {
      const answeredCount = questions.filter(q => q.answered).length;
      if (answeredCount === questions.length) {
        setTimeout(() => {
          setStoryPhase('complete');
          setTimeout(() => {
            alert('Misi selesai! Arus fakta telah dinavigasi!');
            if (navigate) navigate('/leaderboard');
          }, 2000);
        }, 1000);
      }
    }
  }, [questions, navigate]);

  // Initialize selectedOptions when changing questions
  const handleQuestionChange = (index) => {
    setCurrentQuestionIndex(index);
    setUserAnswer('');
    const currentQuestion = questions[index];
    setSelectedOptions(
      currentQuestion.type === 'ya-tidak' || currentQuestion.type === 'benar-salah'
        ? Array(currentQuestion.options.length).fill(undefined)
        : []
    );
    setResult(null);
    setShowFeedback(false);
  };

  const handleSubmitAnswer = () => {
    if (!questions[currentQuestionIndex]) return;

    let isCorrect = false;
    const currentQuestion = questions[currentQuestionIndex];
    console.log('Submitting:', { userAnswer, selectedOptions, correctAnswer: currentQuestion.correct_answer });

    switch (currentQuestion.type) {
      case 'drag-and-drop': {
        const correctOrder = currentQuestion.correct_answer;
        const userOrder = selectedOptions.map(opt => opt.item);
        isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
        break;
      }
      case 'isian-singkat': {
        const normalizeAnswer = (text) =>
          text
            .split('\n')
            .map(s => s.replace(/^\d+\.\s*/, '').trim())
            .filter(s => s)
            .join('\n')
            .toLowerCase();
        isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(currentQuestion.correct_answer);
        break;
      }
      case 'ceklis': {
        isCorrect = JSON.stringify(selectedOptions.sort()) === JSON.stringify(currentQuestion.correct_answer.sort());
        break;
      }
      case 'pg':
        isCorrect = userAnswer === currentQuestion.correct_answer;
        break;
      case 'ya-tidak':
      case 'benar-salah':
        isCorrect = JSON.stringify(selectedOptions) === JSON.stringify(currentQuestion.correct_answer);
        break;
      default:
        break;
    }

    setResult(isCorrect);
    setShowFeedback(true);
    const score = isCorrect ? currentQuestion.score || 10 : 0;

    setQuestions(prev => {
      const updatedQuestions = [...prev];
      updatedQuestions[currentQuestionIndex] = { ...updatedQuestions[currentQuestionIndex], answered: true, correct: isCorrect };
      if (onComplete) onComplete(score, missionId);
      return updatedQuestions;
    });

    setTimeout(() => {
      setUserAnswer('');
      setSelectedOptions([]);
      setResult(null);
      setShowFeedback(false);
      // Move to next unanswered question
      const nextUnanswered = questions.findIndex((q, idx) => !q.answered && idx > currentQuestionIndex);
      if (nextUnanswered !== -1) {
        handleQuestionChange(nextUnanswered);
      }
    }, 2000);
  };

  const renderStoryIntro = () => (
    <div className="bg-gradient-to-r from-blue-900/90 to-teal-800/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-teal-600/30 shadow-2xl mb-12 transform hover:scale-[1.02] transition-all duration-500">
      <div className="flex items-center justify-center mb-6">
        <div className="text-6xl animate-bounce">⿣</div>
      </div>
      <div className="space-y-4 text-center">
        <h2 className="mb-4 text-3xl font-bold text-teal-100">📜 Misi 3 – Arus Lautan Fakta</h2>
        <div className="p-6 border bg-black/30 rounded-xl border-teal-600/20">
          <p className="text-lg leading-relaxed text-teal-50">
            <span className="font-bold text-teal-300">NurM</span> berlayar di Lautan NurMath yang penuh data tak beraturan. 
            Ombak informasi menggoyangkan kapalnya, menyembunyikan fakta berharga di kedalaman.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-teal-50">
            "Aku harus menavigasi arus ini dengan cerdas," gumam NurM sambil menggenggam peta laut ajaib. 
            <span className="font-semibold text-blue-400">"Setiap fakta yang disaring akan membukakan jalan ke kebenaran data!"</span>
          </p>
        </div>
      </div>
    </div>
  );

  const renderQuestion = () => {
    if (!questions[currentQuestionIndex]) return null;
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="relative w-full max-w-3xl p-8 mx-auto overflow-hidden border-2 shadow-2xl bg-gradient-to-br from-blue-900/95 to-teal-900/95 backdrop-blur-lg rounded-3xl border-teal-500/30">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute text-5xl top-6 left-6 animate-pulse">🌊</div>
          <div className="absolute text-3xl delay-300 top-6 right-6 animate-bounce">✨</div>
          <div className="absolute text-4xl delay-700 transform -translate-x-1/2 bottom-6 left-1/2 animate-pulse">📜</div>
        </div>

        <div className="relative z-10">
          <div className="mb-8 text-center">
            <div className="mb-4 text-5xl animate-bounce">🏺</div>
            <h3 className="mb-2 text-3xl font-bold text-teal-200">Soal {currentQuestion.id}</h3>
            <div className="p-4 border bg-teal-900/30 rounded-xl border-teal-600/20">
              <p className="text-sm text-teal-100">NurM menemukan gulungan kuno berisi teka-teki data...</p>
            </div>
          </div>

          <div className="p-6 mb-6 border bg-gradient-to-r from-blue-900/40 to-teal-900/40 rounded-2xl border-teal-500/20">
            <p className="text-xl font-semibold leading-relaxed text-center text-white">
              {currentQuestion.question_text}
            </p>
          </div>

          <div className="space-y-6">
            {currentQuestion.type === 'drag-and-drop' && (
              <div className="text-center">
                <p className="mb-4 text-teal-200">Susun langkah-langkah secara urut:</p>
                <div className="flex flex-col items-center space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {currentQuestion.options
                      .filter(item => !selectedOptions.some(opt => opt.item === item)) // Show only unplaced items
                      .map(item => (
                        <div
                          key={item}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', item)}
                          className="p-3 text-white transition-colors rounded-lg cursor-move bg-blue-700/50 hover:bg-blue-600"
                        >
                          {item}
                        </div>
                      ))}
                  </div>
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const item = e.dataTransfer.getData('text/plain');
                        if (item && !selectedOptions.some(opt => opt.item === item)) {
                          setSelectedOptions(prev => [...prev, { item, target: 'Urutan Langkah' }]);
                        }
                      }}
                      className="p-4 bg-stone-700/50 rounded-lg text-white min-h-[150px] flex items-center justify-center flex-wrap gap-2"
                    >
                      {selectedOptions.length === 0 ? (
                        <span>Urutan Langkah: (Kosong)</span>
                      ) : (
                        selectedOptions.map((opt, idx) => (
                          <div
                            key={opt.item}
                            className="p-2 rounded-lg cursor-pointer bg-teal-600/50"
                            onClick={() => {
                              setSelectedOptions(prev => prev.filter((_, i) => i !== idx));
                            }}
                          >
                            {opt.item}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentQuestion.type === 'ya-tidak' && (
              <div className="space-y-4">
                {currentQuestion.options.map((option, idx) => (
                  <div key={option} className="p-4 border bg-stone-700/60 rounded-xl border-stone-600/30">
                    <p className="mb-2 text-white">{option}</p>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`question-answer-${idx}`}
                          value="Ya"
                          checked={selectedOptions[idx] === 'Ya'}
                          onChange={() => {
                            setSelectedOptions(prev => {
                              const newOptions = [...prev];
                              newOptions[idx] = 'Ya';
                              return newOptions;
                            });
                          }}
                          disabled={showFeedback}
                          className="w-5 h-5 mr-2 text-teal-600 border-teal-500 bg-stone-700 focus:ring-teal-500"
                        />
                        <span className="text-white">Ya</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`question-answer-${idx}`}
                          value="Tidak"
                          checked={selectedOptions[idx] === 'Tidak'}
                          onChange={() => {
                            setSelectedOptions(prev => {
                              const newOptions = [...prev];
                              newOptions[idx] = 'Tidak';
                              return newOptions;
                            });
                          }}
                          disabled={showFeedback}
                          className="w-5 h-5 mr-2 text-teal-600 border-teal-500 bg-stone-700 focus:ring-teal-500"
                        />
                        <span className="text-white">Tidak</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === 'ceklis' && (
              <div className="space-y-4">
                <p className="mb-4 font-semibold text-center text-teal-200">Pilih semua jawaban yang tepat:</p>
                {currentQuestion.options.map((option, idx) => (
                  <label key={option} className="flex items-center p-4 transition-all duration-300 border cursor-pointer bg-stone-700/60 rounded-xl border-stone-600/30 hover:bg-stone-600/60">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(String.fromCharCode(65 + idx))}
                      onChange={(e) => {
                        const value = String.fromCharCode(65 + idx);
                        setSelectedOptions(prev => {
                          if (e.target.checked) {
                            return [...prev, value];
                          } else {
                            return prev.filter(o => o !== value);
                          }
                        });
                      }}
                      disabled={showFeedback}
                      className="w-5 h-5 mr-4 text-teal-600 border-teal-500 rounded bg-stone-700 focus:ring-teal-500"
                    />
                    <span className="text-white transition-colors duration-300 hover:text-teal-200">{`${String.fromCharCode(65 + idx)}. ${option}`}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'pg' && (
              <div className="space-y-4">
                {currentQuestion.options.map((option, idx) => (
                  <label key={option} className="flex items-center p-4 transition-all duration-300 border cursor-pointer bg-stone-700/60 rounded-xl border-stone-600/30 hover:bg-stone-600/60">
                    <input
                      type="radio"
                      name="question-answer"
                      value={String.fromCharCode(65 + idx)}
                      checked={userAnswer === String.fromCharCode(65 + idx)}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={showFeedback}
                      className="w-5 h-5 mr-4 text-teal-600 border-teal-500 bg-stone-700 focus:ring-teal-500"
                    />
                    <span className="text-white transition-colors duration-300 hover:text-teal-200">{`${String.fromCharCode(65 + idx)}. ${option}`}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'isian-singkat' && (
              <div className="text-center">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Tuliskan rencana alur investigasi..."
                  className="w-full max-w-md p-4 text-lg text-center text-white transition-all duration-300 border-2 rounded-xl bg-stone-700/80 border-teal-600/30 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows="4"
                  disabled={showFeedback}
                  aria-label="Masukkan jawaban"
                />
              </div>
            )}

            {currentQuestion.type === 'benar-salah' && (
              <div className="space-y-4">
                {currentQuestion.options.map((option, idx) => (
                  <div key={option} className="p-4 border bg-stone-700/60 rounded-xl border-stone-600/30">
                    <p className="mb-2 text-white">{option}</p>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`question-answer-${idx}`}
                          value="Benar"
                          checked={selectedOptions[idx] === 'Benar'}
                          onChange={() => {
                            setSelectedOptions(prev => {
                              const newOptions = [...prev];
                              newOptions[idx] = 'Benar';
                              return newOptions;
                            });
                          }}
                          disabled={showFeedback}
                          className="w-5 h-5 mr-2 text-teal-600 border-teal-500 bg-stone-700 focus:ring-teal-500"
                        />
                        <span className="text-white">Benar</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`question-answer-${idx}`}
                          value="Salah"
                          checked={selectedOptions[idx] === 'Salah'}
                          onChange={() => {
                            setSelectedOptions(prev => {
                              const newOptions = [...prev];
                              newOptions[idx] = 'Salah';
                              return newOptions;
                            });
                          }}
                          disabled={showFeedback}
                          className="w-5 h-5 mr-2 text-teal-600 border-teal-500 bg-stone-700 focus:ring-teal-500"
                        />
                        <span className="text-white">Salah</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleSubmitAnswer}
              disabled={showFeedback || (
                currentQuestion.type === 'drag-and-drop' ? selectedOptions.length !== currentQuestion.options.length :
                currentQuestion.type === 'ceklis' ? selectedOptions.length === 0 :
                currentQuestion.type === 'isian-singkat' ? !userAnswer.trim() :
                currentQuestion.type === 'pg' ? !userAnswer :
                !selectedOptions.every(opt => opt !== undefined)
              )}
              className="px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform border-2 shadow-lg bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border-teal-500/20"
              aria-label="Kirim jawaban"
            >
              <span className="flex items-center justify-center gap-2">
                ⚡ Aktifkan Kompas Data ⚡
              </span>
            </button>
          </div>

          {showFeedback && (
            <div className={`mt-8 text-center transform animate-bounce ${result ? 'animate-pulse' : ''}`}>
              <div className={`inline-block p-6 rounded-2xl border-2 ${
                result 
                  ? 'bg-green-900/80 border-green-500/50 text-green-300' 
                  : 'bg-red-900/80 border-red-500/50 text-red-300'
              }`}>
                <div className="mb-2 text-4xl">
                  {result ? '🎉' : '💦'} 
                </div>
                <div className="text-2xl font-bold">
                  {result 
                    ? `✨ Luar Biasa! Fakta terungkap! ✨\n🏆 +${currentQuestion.score} XP Penjelajah! 🏆` 
                    : '🔄 Hmm, arusnya masih kacau... coba lagi! 🔄'
                  }
                </div>
                {result && (
                  <div className="mt-2 text-lg text-green-200">
                    "Lautan fakta kini lebih jernih!"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCompletionStory = () => (
    <div className="p-8 text-center transform border-2 shadow-2xl bg-gradient-to-r from-green-900/90 to-teal-800/90 backdrop-blur-sm rounded-3xl border-green-500/30 animate-pulse">
      <div className="mb-6 text-6xl animate-bounce">🏆</div>
      <h2 className="mb-4 text-4xl font-bold text-green-100">Misi Berhasil Diselesaikan!</h2>
      <div className="p-6 border bg-black/30 rounded-xl border-green-500/20">
        <p className="text-xl leading-relaxed text-green-50">
          NurM berhasil menavigasi Arus Lautan Fakta dan menyaring kebenaran data! 
          Cahaya pengetahuan kini memandu kapalnya ke petualangan berikutnya...
        </p>
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="mt-8 text-center">
      {questions.map((question, index) => {
        const isAnswered = question.answered;
        const isCorrect = question.correct;
        const isActive = index === currentQuestionIndex;

        return (
          <button
            key={index}
            onClick={() => {
              if (!isAnswered) {
                handleQuestionChange(index);
              }
            }}
            className={`px-4 py-2 mx-2 rounded-full transition-all duration-300 ${
              isActive 
                ? 'bg-teal-600 text-white' 
                : isAnswered 
                  ? (isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white') 
                  : 'bg-stone-700/50 text-teal-200 hover:bg-teal-500/50'
            } ${isAnswered ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            disabled={isAnswered}
            aria-label={`Pilih soal ${index + 1} ${isAnswered ? '(Sudah dijawab)' : ''}`}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-teal-900 to-gray-900">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute text-6xl top-20 left-10 animate-float">🌊</div>
        <div className="absolute text-4xl delay-1000 top-40 right-20 animate-float">🐳</div>
        <div className="absolute text-5xl bottom-20 left-1/4 animate-float delay-2000">⚓</div>
        <div className="absolute text-3xl bottom-40 right-1/3 animate-float delay-3000">📖</div>
      </div>

      <div className="relative z-10 p-6 font-comic-sans">
        <div className="max-w-6xl mx-auto">
          {isLoading && (
            <div className="space-y-4 text-3xl text-center text-white">
              <div className="text-6xl animate-spin">⚡</div>
              <div>Menjelajah lautan data...</div>
            </div>
          )}

          {error && (
            <div className="space-y-4 text-2xl text-center text-red-400">
              <div className="text-6xl">😱</div>
              <div>{error}</div>
              <button
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  const fetchQuestions = async () => {
                    try {
                      const response = await fetch(`${API_URL}/api/questions/${missionId}`);
                      const data = await response.json();
                      if (response.ok) {
                        setQuestions(data.map((q, index) => ({ ...q, id: index + 1, answered: false, correct: null })));
                      } else {
                        setError(data.error || 'Gagal memuat soal');
                      }
                    } catch (_) {
                      setError('Koneksi gagal. Silakan coba lagi.');
                    } finally {
                      setIsLoading(false);
                    }
                  };
                  fetchQuestions();
                }}
                className="px-6 py-3 text-white transition-all duration-300 bg-teal-600 rounded-xl hover:bg-teal-700"
                aria-label="Coba lagi"
              >
                🔄 Coba Jelajah Lagi
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className="mb-12 text-center">
                <h1 className="mb-6 text-5xl font-bold text-teal-200 md:text-6xl drop-shadow-2xl">
                  ⿣ Misi 3 – Arus Lautan Fakta 🗺️
                </h1>
                <div className="max-w-4xl p-6 mx-auto border bg-gradient-to-r from-blue-900/60 to-teal-900/60 backdrop-blur-sm rounded-2xl border-teal-500/20">
                  <p className="text-xl leading-relaxed text-teal-100 md:text-2xl">
                    <span className="font-bold text-teal-300">NurM</span> harus menavigasi lautan data tak beraturan. 
                    Ayo bantu menyaring <span className="font-semibold text-green-400">fakta yang benar</span>! 🔍✨
                  </p>
                </div>
              </div>

              {storyPhase === 'intro' ? renderStoryIntro() : storyPhase === 'complete' ? renderCompletionStory() : (
                <>
                  {renderQuestion()}
                  {renderPagination()}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .font-comic-sans { font-family: 'Comic Sans MS', cursive, sans-serif; }
      `}</style>
    </div>
  );
};

export default Mission3;
