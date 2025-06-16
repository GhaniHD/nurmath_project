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
  const API_URL = 'http://localhost:3001';

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
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-teal-100 mb-4">📜 Misi 3 – Arus Lautan Fakta</h2>
        <div className="bg-black/30 rounded-xl p-6 border border-teal-600/20">
          <p className="text-lg text-teal-50 leading-relaxed">
            <span className="font-bold text-teal-300">NurM</span> berlayar di Lautan NurMath yang penuh data tak beraturan. 
            Ombak informasi menggoyangkan kapalnya, menyembunyikan fakta berharga di kedalaman.
          </p>
          <p className="text-lg text-teal-50 leading-relaxed mt-4">
            "Aku harus menavigasi arus ini dengan cerdas," gumam NurM sambil menggenggam peta laut ajaib. 
            <span className="text-blue-400 font-semibold">"Setiap fakta yang disaring akan membukakan jalan ke kebenaran data!"</span>
          </p>
        </div>
      </div>
    </div>
  );

  const renderQuestion = () => {
    if (!questions[currentQuestionIndex]) return null;
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="bg-gradient-to-br from-blue-900/95 to-teal-900/95 backdrop-blur-lg rounded-3xl p-8 border-2 border-teal-500/30 shadow-2xl w-full max-w-3xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-6 left-6 text-5xl animate-pulse">🌊</div>
          <div className="absolute top-6 right-6 text-3xl animate-bounce delay-300">✨</div>
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-4xl animate-pulse delay-700">📜</div>
        </div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 animate-bounce">🏺</div>
            <h3 className="text-3xl font-bold text-teal-200 mb-2">Soal {currentQuestion.id}</h3>
            <div className="bg-teal-900/30 rounded-xl p-4 border border-teal-600/20">
              <p className="text-teal-100 text-sm">NurM menemukan gulungan kuno berisi teka-teki data...</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/40 to-teal-900/40 rounded-2xl p-6 border border-teal-500/20 mb-6">
            <p className="text-xl font-semibold text-white text-center leading-relaxed">
              {currentQuestion.question_text}
            </p>
          </div>

          <div className="space-y-6">
            {currentQuestion.type === 'drag-and-drop' && (
              <div className="text-center">
                <p className="text-teal-200 mb-4">Susun langkah-langkah secara urut:</p>
                <div className="flex flex-col items-center space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {currentQuestion.options
                      .filter(item => !selectedOptions.some(opt => opt.item === item)) // Show only unplaced items
                      .map(item => (
                        <div
                          key={item}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', item)}
                          className="p-3 bg-blue-700/50 rounded-lg cursor-move text-white hover:bg-blue-600 transition-colors"
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
                            className="p-2 bg-teal-600/50 rounded-lg cursor-pointer"
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
                  <div key={option} className="p-4 bg-stone-700/60 rounded-xl border border-stone-600/30">
                    <p className="text-white mb-2">{option}</p>
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
                          className="w-5 h-5 text-teal-600 bg-stone-700 border-teal-500 focus:ring-teal-500 mr-2"
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
                          className="w-5 h-5 text-teal-600 bg-stone-700 border-teal-500 focus:ring-teal-500 mr-2"
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
                <p className="text-teal-200 text-center font-semibold mb-4">Pilih semua jawaban yang tepat:</p>
                {currentQuestion.options.map((option, idx) => (
                  <label key={option} className="flex items-center p-4 bg-stone-700/60 rounded-xl border border-stone-600/30 hover:bg-stone-600/60 transition-all duration-300 cursor-pointer">
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
                      className="w-5 h-5 text-teal-600 bg-stone-700 border-teal-500 rounded focus:ring-teal-500 mr-4"
                    />
                    <span className="text-white hover:text-teal-200 transition-colors duration-300">{`${String.fromCharCode(65 + idx)}. ${option}`}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'pg' && (
              <div className="space-y-4">
                {currentQuestion.options.map((option, idx) => (
                  <label key={option} className="flex items-center p-4 bg-stone-700/60 rounded-xl border border-stone-600/30 hover:bg-stone-600/60 transition-all duration-300 cursor-pointer">
                    <input
                      type="radio"
                      name="question-answer"
                      value={String.fromCharCode(65 + idx)}
                      checked={userAnswer === String.fromCharCode(65 + idx)}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={showFeedback}
                      className="w-5 h-5 text-teal-600 bg-stone-700 border-teal-500 focus:ring-teal-500 mr-4"
                    />
                    <span className="text-white hover:text-teal-200 transition-colors duration-300">{`${String.fromCharCode(65 + idx)}. ${option}`}</span>
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
                  className="p-4 rounded-xl bg-stone-700/80 text-white border-2 border-teal-600/30 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center text-lg transition-all duration-300"
                  rows="4"
                  disabled={showFeedback}
                  aria-label="Masukkan jawaban"
                />
              </div>
            )}

            {currentQuestion.type === 'benar-salah' && (
              <div className="space-y-4">
                {currentQuestion.options.map((option, idx) => (
                  <div key={option} className="p-4 bg-stone-700/60 rounded-xl border border-stone-600/30">
                    <p className="text-white mb-2">{option}</p>
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
                          className="w-5 h-5 text-teal-600 bg-stone-700 border-teal-500 focus:ring-teal-500 mr-2"
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
                          className="w-5 h-5 text-teal-600 bg-stone-700 border-teal-500 focus:ring-teal-500 mr-2"
                        />
                        <span className="text-white">Salah</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={handleSubmitAnswer}
              disabled={showFeedback || (
                currentQuestion.type === 'drag-and-drop' ? selectedOptions.length !== currentQuestion.options.length :
                currentQuestion.type === 'ceklis' ? selectedOptions.length === 0 :
                currentQuestion.type === 'isian-singkat' ? !userAnswer.trim() :
                currentQuestion.type === 'pg' ? !userAnswer :
                !selectedOptions.every(opt => opt !== undefined)
              )}
              className="px-8 py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 text-lg border-2 border-teal-500/20"
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
                <div className="text-4xl mb-2">
                  {result ? '🎉' : '💦'} 
                </div>
                <div className="text-2xl font-bold">
                  {result 
                    ? `✨ Luar Biasa! Fakta terungkap! ✨\n🏆 +${currentQuestion.score} XP Penjelajah! 🏆` 
                    : '🔄 Hmm, arusnya masih kacau... coba lagi! 🔄'
                  }
                </div>
                {result && (
                  <div className="text-green-200 mt-2 text-lg">
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
    <div className="bg-gradient-to-r from-green-900/90 to-teal-800/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-green-500/30 shadow-2xl text-center transform animate-pulse">
      <div className="text-6xl mb-6 animate-bounce">🏆</div>
      <h2 className="text-4xl font-bold text-green-100 mb-4">Misi Berhasil Diselesaikan!</h2>
      <div className="bg-black/30 rounded-xl p-6 border border-green-500/20">
        <p className="text-xl text-green-50 leading-relaxed">
          NurM berhasil menavigasi Arus Lautan Fakta dan menyaring kebenaran data! 
          Cahaya pengetahuan kini memandu kapalnya ke petualangan berikutnya...
        </p>
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="text-center mt-8">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 text-6xl animate-float">🌊</div>
        <div className="absolute top-40 right-20 text-4xl animate-float delay-1000">🐳</div>
        <div className="absolute bottom-20 left-1/4 text-5xl animate-float delay-2000">⚓</div>
        <div className="absolute bottom-40 right-1/3 text-3xl animate-float delay-3000">📖</div>
      </div>

      <div className="relative z-10 p-6 font-comic-sans">
        <div className="max-w-6xl mx-auto">
          {isLoading && (
            <div className="text-center text-white text-3xl space-y-4">
              <div className="animate-spin text-6xl">⚡</div>
              <div>Menjelajah lautan data...</div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-400 text-2xl space-y-4">
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
                className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-300"
                aria-label="Coba lagi"
              >
                🔄 Coba Jelajah Lagi
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold text-teal-200 mb-6 drop-shadow-2xl">
                  ⿣ Misi 3 – Arus Lautan Fakta 🗺️
                </h1>
                <div className="bg-gradient-to-r from-blue-900/60 to-teal-900/60 backdrop-blur-sm rounded-2xl p-6 border border-teal-500/20 max-w-4xl mx-auto">
                  <p className="text-xl md:text-2xl text-teal-100 leading-relaxed">
                    <span className="font-bold text-teal-300">NurM</span> harus menavigasi lautan data tak beraturan. 
                    Ayo bantu menyaring <span className="text-green-400 font-semibold">fakta yang benar</span>! 🔍✨
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
