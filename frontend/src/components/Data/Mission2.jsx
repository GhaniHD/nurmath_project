import { useState, useEffect } from 'react';

const Mission2 = ({ missionId, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [result, setResult] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [digAnimation, setDigAnimation] = useState(null);
  const [storyPhase, setStoryPhase] = useState('intro');

  const navigate = null;
  const API_URL = import.meta.env.VITE_API_URL;

  // Load saved progress from localStorage on mount
  useEffect(() => {
    const savedAnsweredQuestions = localStorage.getItem(`answeredQuestions_${missionId}`);
    const savedStoryPhase = localStorage.getItem(`storyPhase_${missionId}`);
    if (savedAnsweredQuestions) {
      setAnsweredQuestions(JSON.parse(savedAnsweredQuestions));
    }
    if (savedStoryPhase) {
      setStoryPhase(savedStoryPhase);
    }
  }, [missionId]);

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/questions/${missionId}`);
        const data = await response.json();
        if (response.ok) {
          setQuestions(data.map((q, index) => ({ ...q, id: q.id || index + 1 })));
        } else {
          setError(data.error || 'Gagal memuat soal');
        }
      } catch (_) {
        setError('Koneksi gagal. Silakan coba lagi. Pastikan server API Anda berjalan.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [missionId, API_URL]);

  // Save answeredQuestions and storyPhase to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`answeredQuestions_${missionId}`, JSON.stringify(answeredQuestions));
    localStorage.setItem(`storyPhase_${missionId}`, storyPhase);
  }, [answeredQuestions, storyPhase, missionId]);

  // Handle mission completion logic
  useEffect(() => {
    if (questions.length > 0) {
      const answeredCount = Object.keys(answeredQuestions).length;
      if (answeredCount === questions.length && answeredCount > 0) {
        setTimeout(() => {
          setStoryPhase('complete');
          console.log('Misi selesai! Semua lapisan tanah telah digali!');
          if (onComplete) {
            onComplete();
          }
        }, 2000);
      }
    }
  }, [answeredQuestions, questions.length, onComplete]);

  // Handle clicking on a soil box to dig
  const handleBoxClick = (boxIndex) => {
    const unansweredQuestions = questions.filter(q => !answeredQuestions[q.id]);
    if (unansweredQuestions.length > 0) {
      setDigAnimation(boxIndex);
      setTimeout(() => {
        const randomQuestion = unansweredQuestions[Math.floor(Math.random() * unansweredQuestions.length)];
        setSelectedBox(boxIndex);
        setCurrentQuestion(randomQuestion);
        setUserAnswer('');
        setSelectedOptions([]);
        setDigAnimation(null);
        setStoryPhase('digging');
      }, 1500);
    }
  };

  // Handle submitting an answer
  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;

    let isCorrect = false;
    switch (currentQuestion.type) {
      case 'drag-and-drop': {
        const sortedSelected = [...selectedOptions].sort((a, b) => a.item.localeCompare(b.item));
        const sortedCorrect = Object.entries(currentQuestion.correct_answer)
          .map(([item, target]) => ({ item, target }))
          .sort((a, b) => a.item.localeCompare(b.item));
        console.log('Selected:', sortedSelected);
        console.log('Correct:', sortedCorrect);
        isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
        break;
      }
      case 'isian-singkat': {
        isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.correct_answer.toLowerCase();
        break;
      }
      case 'ceklis': {
        isCorrect = JSON.stringify([...selectedOptions].sort()) === JSON.stringify([...currentQuestion.correct_answer].sort());
        break;
      }
      case 'pg':
      case 'ya-tidak':
        isCorrect = userAnswer === currentQuestion.correct_answer;
        break;
      default:
        break;
    }

    setResult(isCorrect);
    setShowFeedback(true);
    const score = isCorrect ? currentQuestion.score : 0;

    if (onComplete) {
      onComplete(score, missionId);
    }

    setAnsweredQuestions(prev => ({ ...prev, [currentQuestion.id]: true }));

    setTimeout(() => {
      setCurrentQuestion(null);
      setSelectedBox(null);
      setUserAnswer('');
      setSelectedOptions([]);
      setResult(null);
      setShowFeedback(false);
      setStoryPhase('exploring');
    }, 2000);
  };

  // Handle restarting the mission
  const handlePlayAgain = () => {
    localStorage.removeItem(`answeredQuestions_${missionId}`);
    localStorage.removeItem(`storyPhase_${missionId}`);
    setAnsweredQuestions({});
    setStoryPhase('intro');
    setCurrentQuestion(null);
    setSelectedBox(null);
    setUserAnswer('');
    setSelectedOptions([]);
    setResult(null);
    setShowFeedback(false);
    const fetchQuestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/questions/${missionId}`);
        const data = await response.json();
        if (response.ok) {
          setQuestions(data.map((q, index) => ({ ...q, id: q.id || index + 1 })));
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
  };

  // Component to render the introduction story
  const renderStoryIntro = () => (
    <div className="bg-gradient-to-r from-amber-900/90 to-yellow-800/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-yellow-600/30 shadow-2xl mb-12 transform hover:scale-[1.02] transition-all duration-500">
      <div className="flex items-center justify-center mb-6">
        <div className="text-6xl animate-bounce">🗺️</div>
      </div>
      <div className="space-y-4 text-center">
        <h2 className="mb-4 text-3xl font-bold text-yellow-100">📜 Kisah Dimulai...</h2>
        <div className="p-6 border bg-black/30 rounded-xl border-yellow-600/20">
          <p className="text-lg leading-relaxed text-yellow-50">
            <span className="font-bold text-yellow-300">NurM</span> berdiri di tepi jurang data yang dalam. 
            Angin berdesir membawa kabut misterius yang menutupi lapisan-lapisan tanah di bawahnya. 
            Di kedalaman tersebut, tersembunyi <span className="font-semibold text-green-400">teknik-teknik pengumpulan data</span> 
            yang telah hilang selama berabad-abad.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-yellow-50">
            "Aku harus menggali setiap lapisan dengan hati-hati," gumam NurM sambil menggenggam beliung ajaib. 
            <span className="font-semibold text-blue-400">"Setiap pertanyaan yang terjawab akan mengungkap rahasia data yang tersembunyi!"</span>
          </p>
        </div>
      </div>
    </div>
  );

  // Component to render the mystery boxes (soil layers)
  const renderMysteryBoxes = () => {
    const soilLayers = [
      { name: "Lapisan Humus", icon: "🌱", depth: "0-10cm", color: "from-amber-800 to-yellow-700" },
      { name: "Lapisan Tanah Atas", icon: "🪨", depth: "10-30cm", color: "from-orange-800 to-amber-700" },
      { name: "Lapisan Liat", icon: "🧱", depth: "30-60cm", color: "from-red-900 to-orange-800" },
      { name: "Lapisan Kerikil", icon: "⚪", depth: "60-100cm", color: "from-gray-800 to-red-900" },
      { name: "Lapisan Batu", icon: "🗿", depth: "100-150cm", color: "from-slate-900 to-gray-800" },
      { name: "Lapisan Batuan Dasar", icon: "💎", depth: "150cm+", color: "from-black to-slate-900" },
    ];

    return (
      <div className="space-y-12">
        {storyPhase === 'intro' && renderStoryIntro()}
        
        <div className="p-10 border-2 shadow-2xl bg-gradient-to-b from-brown-900/80 to-stone-900/80 backdrop-blur-sm rounded-3xl border-amber-600/30">
          <div className="mb-10 text-center">
            <div className="mb-6 text-5xl">⛏️ 🏛️ ⛏️</div>
            <h3 className="mb-4 text-3xl font-bold text-amber-100">Situs Penggalian Data Kuno</h3>
            <p className="text-lg text-amber-200/80">Pilih lapisan tanah untuk memulai penggalian arkeologi data!</p>
          </div>

          <div className="grid max-w-5xl grid-cols-1 gap-8 mx-auto sm:grid-cols-2 md:grid-cols-3">
            {soilLayers.map((layer, index) => {
              const question = questions.find(q => q.id === (index + 1));
              const isAnswered = question && answeredQuestions[question.id];
              const isDigging = digAnimation === index;

              if (isAnswered) {
                return null; // Remove answered boxes
              }

              return (
                <button
                  key={index}
                  onClick={() => handleBoxClick(index)}
                  disabled={questions.length === Object.keys(answeredQuestions).length}
                  className={`relative group p-8 bg-gradient-to-br ${layer.color} rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 disabled:opacity-50 border-2 border-stone-600/30 overflow-hidden ${isDigging ? 'animate-pulse scale-110' : ''}`}
                  aria-label={`Pilih ${layer.name}`}
                >
                  {isDigging && (
                    <div className="absolute inset-0 bg-yellow-400/20 animate-ping rounded-2xl"></div>
                  )}
                  <div className="absolute text-yellow-400 top-4 right-4 animate-pulse opacity-60">✨</div>
                  <div className="absolute text-yellow-300 delay-300 bottom-4 left-4 animate-pulse opacity-40">⭐</div>
                  
                  <div className="relative z-10 text-center">
                    <div className="mb-4 text-5xl transition-transform duration-300 transform group-hover:scale-110">
                      {isDigging ? '⚡' : layer.icon}
                    </div>
                    <div className="mb-2 text-xl font-bold text-white">{layer.name}</div>
                    <div className="text-sm text-stone-300 opacity-80">{layer.depth}</div>
                  </div>
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 group-hover:opacity-100 rounded-2xl"></div>
                </button>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <div className="inline-block p-6 rounded-full bg-stone-800/50">
              <div className="text-xl font-semibold text-amber-300">
                📊 Kemajuan Penggalian: {Object.keys(answeredQuestions).length}/{questions.length}
              </div>
              <div className="h-4 mx-auto mt-4 overflow-hidden rounded-full w-80 bg-stone-700">
                <div 
                  className="h-full transition-all duration-1000 rounded-full shadow-lg bg-gradient-to-r from-amber-500 to-yellow-400"
                  style={{ width: `${(Object.keys(answeredQuestions).length / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component to render the current question
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <div className="relative w-full max-w-3xl p-8 mx-auto overflow-hidden border-2 shadow-2xl bg-gradient-to-br from-slate-900/95 to-stone-900/95 backdrop-blur-sm rounded-3xl border-amber-500/30">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute text-5xl top-6 left-6 animate-pulse">🔮</div>
          <div className="absolute text-3xl delay-300 top-6 right-6 animate-bounce">✨</div>
          <div className="absolute text-4xl delay-700 transform -translate-x-1/2 bottom-6 left-1/2 animate-pulse">📜</div>
        </div>

        <div className="relative z-10">
          <div className="mb-8 text-center">
            <div className="mb-4 text-5xl animate-bounce">🏺</div>
            <h3 className="mb-2 text-3xl font-bold text-amber-200">Artefak Data Ditemukan!</h3>
            <div className="p-4 border bg-amber-900/30 rounded-xl border-amber-600/20">
              <p className="text-sm text-amber-100">NurM menemukan tablet kuno berisi pertanyaan misterius...</p>
            </div>
          </div>

          <div className="p-6 mb-6 border bg-gradient-to-r from-amber-900/40 to-yellow-900/40 rounded-2xl border-amber-500/20">
            <p className="text-xl font-semibold leading-relaxed text-center text-white">
              {currentQuestion.question_text}
            </p>
          </div>

          <div className="space-y-6">
            {currentQuestion.type === 'drag-and-drop' && (
              <div className="text-center">
                <p className="mb-4 text-amber-200">Seret data ke kolom yang sesuai:</p>
                <div className="flex flex-col items-center space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {currentQuestion.options
                      .filter(item => !selectedOptions.some(opt => opt.item === item)) // Show only unplaced items
                      .map(item => (
                        <div
                          key={item}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', item)}
                          className="p-3 text-white transition-colors rounded-lg cursor-move bg-amber-700/50 hover:bg-amber-600"
                        >
                          {item}
                        </div>
                      ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {currentQuestion.targets.map(target => (
                      <div
                        key={target}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const item = e.dataTransfer.getData('text/plain');
                          if (item && !selectedOptions.some(opt => opt.item === item)) {
                            setSelectedOptions(prev => [...prev, { item, target }]);
                          }
                        }}
                        className="p-3 bg-stone-700/50 rounded-lg text-white min-h-[60px] flex items-center justify-center flex-wrap gap-2"
                      >
                        {target}: {selectedOptions.filter(opt => opt.target === target).length === 0 ? (
                          <span>(Kosong)</span>
                        ) : (
                          selectedOptions
                            .filter(opt => opt.target === target)
                            .map(opt => (
                              <div
                                key={opt.item}
                                className="p-2 rounded-lg cursor-pointer bg-amber-600/50"
                                onClick={() => {
                                  setSelectedOptions(prev => prev.filter(o => o.item !== opt.item));
                                }}
                              >
                                {opt.item}
                              </div>
                            ))
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentQuestion.type === 'isian-singkat' && (
              <div className="text-center">
                {currentQuestion.audio_url && <audio controls src={currentQuestion.audio_url} className="mb-4" />}
                <div className="relative">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Tuliskan jawaban magis mu..."
                    className="w-full max-w-md p-4 text-lg text-center text-white transition-all duration-300 border-2 rounded-xl bg-slate-800/80 border-amber-600/30 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    disabled={showFeedback}
                    aria-label="Masukkan jawaban"
                  />
                  <div className="absolute transform -translate-y-1/2 right-4 top-1/2 text-amber-400">🖊️</div>
                </div>
              </div>
            )}

            {currentQuestion.type === 'ceklis' && (
              <div className="space-y-4">
                <p className="mb-4 font-semibold text-center text-amber-200">Pilih semua jawaban yang benar:</p>
                {currentQuestion.options.map(option => (
                  <label key={option} className="flex items-center p-4 transition-all duration-300 border cursor-pointer bg-slate-800/60 rounded-xl border-slate-600/30 hover:bg-slate-700/60">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedOptions(prev => [...prev, option]);
                        else setSelectedOptions(prev => prev.filter(o => o !== option));
                      }}
                      disabled={showFeedback}
                      className="w-5 h-5 mr-4 rounded text-amber-600 bg-slate-700 border-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-white transition-colors duration-300 hover:text-amber-200">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {(currentQuestion.type === 'pg' || currentQuestion.type === 'ya-tidak') && (
              <div className="space-y-4">
                {currentQuestion.options.map(option => (
                  <label key={option} className="flex items-center p-4 transition-all duration-300 border cursor-pointer bg-slate-800/60 rounded-xl border-slate-600/30 hover:bg-slate-700/60">
                    <input
                      type="radio"
                      name="question-answer"
                      value={option}
                      checked={userAnswer === option}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={showFeedback}
                      className="w-5 h-5 mr-4 text-amber-600 bg-slate-700 border-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-white transition-colors duration-300 hover:text-amber-200">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleSubmitAnswer}
              disabled={showFeedback || 
                (currentQuestion.type === 'drag-and-drop' && selectedOptions.length !== currentQuestion.options.length) || 
                ((currentQuestion.type === 'ceklis' || currentQuestion.type === 'pg' || currentQuestion.type === 'ya-tidak') && selectedOptions.length === 0 && !userAnswer) ||
                (currentQuestion.type === 'isian-singkat' && !userAnswer.trim())
              }
              className="px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform border-2 shadow-lg bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl hover:from-amber-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border-amber-500/20"
              aria-label="Kirim jawaban"
            >
              <span className="flex items-center justify-center gap-2">
                ⚡ Aktifkan Mantra Data ⚡
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
                  {result ? '🎉' : '💫'} 
                </div>
                <div className="text-2xl font-bold">
                  {result 
                    ? `✨ Hebat! Data berhasil digali! ✨\n🏆 +${currentQuestion.score} XP Penjelajah! 🏆` 
                    : '🔄 Hmm, coba gali lebih dalam lagi... 🔄'
                  }
                </div>
                {result && (
                  <div className="mt-2 text-lg text-green-200">
                    "Pengetahuan baru telah terungkap dari kedalaman data!"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component to render the completion story with leaderboard/play again options
  const renderCompletionStory = () => (
    <div className="p-8 text-center transform border-2 shadow-2xl bg-gradient-to-r from-green-900/90 to-emerald-800/90 backdrop-blur-sm rounded-3xl border-green-500/30 animate-pulse">
      <div className="mb-6 text-6xl animate-bounce">🏆</div>
      <h2 className="mb-4 text-4xl font-bold text-green-100">Misi Berhasil Diselesaikan!</h2>
      <div className="p-6 border bg-black/30 rounded-xl border-green-500/20">
        <p className="text-xl leading-relaxed text-green-50">
          NurM berhasil menggali semua lapisan tanah dan mengungkap rahasia teknik pengumpulan data yang hilang! 
          Cahaya kebijaksaan kini bersinar terang, menerangi jalan menuju petualangan data berikutnya...
        </p>
      </div>
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => navigate ? navigate('/leaderboard') : console.log('Navigating to leaderboard...')}
          className="px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform border-2 shadow-lg bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl hover:from-blue-700 hover:to-blue-900 hover:scale-105 border-blue-500/20"
          aria-label="Lihat Leaderboard"
        >
          🏅 Lihat Leaderboard
        </button>
        <button
          onClick={handlePlayAgain}
          className="px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform border-2 shadow-lg bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl hover:from-amber-700 hover:to-yellow-700 hover:scale-105 border-amber-500/20"
          aria-label="Main Lagi"
        >
          🔄 Main Lagi
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-900 via-stone-900 to-slate-900 font-inter">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute text-6xl top-20 left-10 animate-float">🌟</div>
        <div className="absolute text-4xl delay-1000 top-40 right-20 animate-float">🗿</div>
        <div className="absolute text-5xl bottom-20 left-1/4 animate-float delay-2000">⚱️</div>
        <div className="absolute text-3xl bottom-40 right-1/3 animate-float delay-3000">📚</div>
      </div>

      <div className="fixed z-20 top-4 left-4">
        <button
          onClick={() => (window.location.href = '/data')}
          className="group relative px-4 py-2 bg-gradient-to-r from-amber-600/80 to-orange-700/80 rounded-lg text-amber-200 font-semibold text-sm shadow-[0_4px_12px_rgba(255,107,0,0.3)] hover:-translate-y-1 transition-all duration-300"
        >
          <span className="relative z-10">← Kembali</span>
          <div className="absolute inset-0 transition-opacity duration-300 rounded-lg opacity-0 bg-amber-500/30 group-hover:opacity-100" />
        </button>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {isLoading && (
            <div className="space-y-4 text-3xl text-center text-white">
              <div className="text-6xl animate-spin">⚡</div>
              <div>Menggali data dari kedalaman bumi...</div>
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
                    setIsLoading(true);
                    setError(null);
                    try {
                      const response = await fetch(`${API_URL}/api/questions/${missionId}`);
                      const data = await response.json();
                      if (response.ok) {
                        setQuestions(data.map((q, index) => ({ ...q, id: q.id || index + 1 })));
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
                className="px-6 py-3 text-white transition-all duration-300 bg-amber-600 rounded-xl hover:bg-amber-700"
                aria-label="Coba lagi"
              >
                🔄 Coba Gali Lagi
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className="mb-12 text-center">
                <h1 className="mb-6 text-5xl font-bold md:text-6xl text-amber-200 drop-shadow-2xl">
                  ⛏️ Misi 2 – Tanah Data yang Hilang 🗺️
                </h1>
                <div className="max-w-4xl p-6 mx-auto border bg-gradient-to-r from-amber-900/60 to-yellow-900/60 backdrop-blur-sm rounded-2xl border-amber-500/20">
                  <p className="text-xl leading-relaxed md:text-2xl text-amber-100">
                    <span className="font-bold text-yellow-300">NurM</span> harus menggali informasi yang tersembunyi dalam lapisan-lapisan tanah. 
                    Ayo bantu memilih <span className="font-semibold text-green-400">teknik pengumpulan data</span> yang tepat! 🔍✨
                  </p>
                </div>
              </div>

              {storyPhase === 'complete' ? renderCompletionStory() : 
                currentQuestion ? renderQuestion() : renderMysteryBoxes()}
            </>
          )}
        </div>
      </div>

      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

        body {
          font-family: 'Inter', sans-serif;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        `}
      </style>
    </div>
  );
};

export default Mission2;