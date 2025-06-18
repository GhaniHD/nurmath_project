import { useState, useEffect } from 'react';

const Mission2Diagram = ({ missionId, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [selectedCloud, setSelectedCloud] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [result, setResult] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flyAnimation, setFlyAnimation] = useState(null);
  const [storyPhase, setStoryPhase] = useState('intro');
  const [characterMessage, setCharacterMessage] = useState('Selamat datang, Penjelajah Langit!');

  const navigate = null; // Demo mode - navigation disabled
  const API_URL = 'http://localhost:3001';

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
          setCharacterMessage('Pilih awan untuk mulai menjelajahi langit!');
        } else {
          setError(data.error || 'Gagal memuat soal');
          setCharacterMessage('Oh tidak, ada gangguan di angkasa!');
        }
      } catch (_) {
        setError('Koneksi gagal. Silakan coba lagi.');
        setCharacterMessage('Koneksi ke bintang-bintang terputus!');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [missionId, API_URL]);

  // Save answeredQuestions and storyPhase to localStorage
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
          setCharacterMessage('Selamat! Kamu telah menaklukkan misteri langit!');
          console.log('Misi selesai! Semua awan telah dijelajahi!');
          if (onComplete) {
            onComplete();
          }
        }, 2000);
      }
    }
  }, [answeredQuestions, questions.length, onComplete]);

  // Handle clicking on a cloud to explore
  const handleCloudClick = (cloudIndex) => {
    const unansweredQuestions = questions.filter(q => !answeredQuestions[q.id]);
    if (unansweredQuestions.length > 0) {
      setFlyAnimation(cloudIndex);
      setCharacterMessage('Terbang ke awan itu! Sedang mencari rahasia...');
      setTimeout(() => {
        const randomQuestion = unansweredQuestions[Math.floor(Math.random() * unansweredQuestions.length)];
        setSelectedCloud(cloudIndex);
        setCurrentQuestion(randomQuestion);
        setUserAnswer('');
        setSelectedOptions([]);
        setFlyAnimation(null);
        setStoryPhase('exploring');
        setCharacterMessage('Awan ini menyimpan pertanyaan misterius!');
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
    setCharacterMessage(isCorrect ? 'Luar biasa! Kamu menemukan rahasia bintang!' : 'Hmm, coba terbang lebih tinggi lagi!');

    if (onComplete) {
      onComplete(score, missionId);
    }

    setAnsweredQuestions(prev => ({ ...prev, [currentQuestion.id]: true }));

    setTimeout(() => {
      setCurrentQuestion(null);
      setSelectedCloud(null);
      setUserAnswer('');
      setSelectedOptions([]);
      setResult(null);
      setShowFeedback(false);
      setStoryPhase('exploring');
      setCharacterMessage('Pilih awan lain untuk melanjutkan petualangan!');
    }, 2000);
  };

  // Handle restarting the mission
  const handlePlayAgain = () => {
    localStorage.removeItem(`answeredQuestions_${missionId}`);
    localStorage.removeItem(`storyPhase_${missionId}`);
    setAnsweredQuestions({});
    setStoryPhase('intro');
    setCurrentQuestion(null);
    setSelectedCloud(null);
    setUserAnswer('');
    setSelectedOptions([]);
    setResult(null);
    setShowFeedback(false);
    setCharacterMessage('Petualangan baru dimulai! Ayo terbang lagi!');
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

  // Interactive character component
  const renderCharacter = () => (
    <div className="fixed bottom-10 right-10 z-20 flex flex-col items-end gap-4">
      <div className="bg-blue-900/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-400/30 max-w-xs">
        <p className="text-white text-lg font-semibold animate-pulse">{characterMessage}</p>
      </div>
      <div className="relative">
        <div className="text-6xl animate-bounce">🧙‍♂️</div>
        <div className="absolute -top-2 -right-2 text-2xl animate-spin">✨</div>
      </div>
    </div>
  );

  // Component to render the introduction story
  const renderStoryIntro = () => (
    <div className="bg-gradient-to-r from-blue-900/90 to-indigo-800/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-blue-400/30 shadow-2xl mb-12 transform hover:scale-[1.02] transition-all duration-500">
      <div className="flex items-center justify-center mb-6">
        <div className="text-6xl animate-bounce">🌌</div>
      </div>
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-blue-100 mb-4">📜 Petualangan Langit Dimulai...</h2>
        <div className="bg-black/30 rounded-xl p-6 border border-blue-400/20">
          <p className="text-lg text-blue-50 leading-relaxed">
            <span className="font-bold text-blue-300">Astra</span> melayang di antara bintang-bintang di langit malam yang luas. 
            Kabut kosmik menyembunyikan <span className="text-blue-400 font-semibold">rahasia data langit</span> di dalam awan-awan misterius.
          </p>
          <p className="text-lg text-blue-50 leading-relaxed mt-4">
            "Aku harus menjelajahi setiap awan dengan hati-hati," gumam Astra sambil memegang tongkat bintang. 
            <span className="text-blue-400 font-semibold">"Setiap pertanyaan yang terjawab akan membuka rahasia kosmos!"</span>
          </p>
        </div>
      </div>
    </div>
  );

  // Component to render the mystery clouds
  const renderMysteryClouds = () => {
    const cloudLayers = [
      { name: "Awan Cirrus", icon: "☁️", altitude: "8-12km", color: "from-blue-600 to-indigo-500" },
      { name: "Awan Cumulus", icon: "⛅", altitude: "2-7km", color: "from-blue-700 to-sky-500" },
      { name: "Awan Stratus", icon: "🌫️", altitude: "0-2km", color: "from-gray-600 to-blue-600" },
      { name: "Awan Nimbus", icon: "🌧️", altitude: "1-5km", color: "from-gray-700 to-blue-700" },
      { name: "Awan Lenticular", icon: "🌥️", altitude: "6-12km", color: "from-indigo-600 to-blue-600" },
      { name: "Awan Noctilucent", icon: "🌙", altitude: "75-85km", color: "from-blue-800 to-indigo-700" },
    ];

    return (
      <div className="space-y-12">
        {storyPhase === 'intro' && renderStoryIntro()}
        
        <div className="bg-gradient-to-b from-blue-900/80 to-indigo-900/80 backdrop-blur-sm rounded-3xl p-10 border-2 border-blue-400/30 shadow-2xl">
          <div className="text-center mb-10">
            <div className="text-5xl mb-6">✈️ 🌌 ✈️</div>
            <h3 className="text-3xl font-bold text-blue-100 mb-4">Petualangan Langit Misterius</h3>
            <p className="text-blue-200/80 text-lg">Pilih awan untuk mulai menjelajahi rahasia langit!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {cloudLayers.map((layer, index) => {
              const question = questions.find(q => q.id === (index + 1));
              const isAnswered = question && answeredQuestions[question.id];
              const isFlying = flyAnimation === index;

              if (isAnswered) {
                return null; // Remove answered clouds
              }

              return (
                <button
                  key={index}
                  onClick={() => handleCloudClick(index)}
                  disabled={questions.length === Object.keys(answeredQuestions).length}
                  className={`relative group p-8 bg-gradient-to-br ${layer.color} rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 disabled:opacity-50 border-2 border-blue-500/30 overflow-hidden ${isFlying ? 'animate-pulse scale-110' : ''}`}
                  aria-label={`Pilih ${layer.name}`}
                >
                  {isFlying && (
                    <div className="absolute inset-0 bg-blue-400/20 animate-ping rounded-2xl"></div>
                  )}
                  <div className="absolute top-4 right-4 text-blue-400 animate-pulse opacity-60">🌟</div>
                  <div className="absolute bottom-4 left-4 text-blue-300 animate-pulse opacity-40 delay-300">✨</div>
                  
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {isFlying ? '⚡' : layer.icon}
                    </div>
                    <div className="text-white font-bold text-xl mb-2">{layer.name}</div>
                    <div className="text-blue-300 text-sm opacity-80">{layer.altitude}</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-400/0 via-blue-400/10 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </button>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <div className="bg-blue-800/50 rounded-full p-6 inline-block">
              <div className="text-blue-300 text-xl font-semibold">
                🌠 Kemajuan Penjelajahan: {Object.keys(answeredQuestions).length}/{questions.length}
              </div>
              <div className="w-80 bg-blue-700 rounded-full h-4 mt-4 mx-auto overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-1000 shadow-lg"
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
      <div className="bg-gradient-to-br from-blue-900/95 to-indigo-900/95 backdrop-blur-sm rounded-3xl p-8 border-2 border-blue-400/30 shadow-2xl w-full max-w-3xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-6 left-6 text-5xl animate-pulse">🌟</div>
          <div className="absolute top-6 right-6 text-3xl animate-bounce delay-300">✨</div>
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-4xl animate-pulse delay-700">🌌</div>
        </div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 animate-bounce">⭐</div>
            <h3 className="text-3xl font-bold text-blue-200 mb-2">Bintang Data Ditemukan!</h3>
            <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-400/20">
              <p className="text-blue-100 text-sm">Astra menemukan konstelasi berisi pertanyaan misterius...</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-2xl p-6 border border-blue-400/20 mb-6">
            <p className="text-xl font-semibold text-white text-center leading-relaxed">
              {currentQuestion.question_text}
            </p>
          </div>

          <div className="space-y-6">
            {currentQuestion.type === 'drag-and-drop' && (
              <div className="text-center">
                <p className="text-blue-200 mb-4">Seret data ke konstelasi yang sesuai:</p>
                <div className="flex flex-col items-center space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {currentQuestion.options
                      .filter(item => !selectedOptions.some(opt => opt.item === item))
                      .map(item => (
                        <div
                          key={item}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', item)}
                          className="p-3 bg-blue-600/50 rounded-lg cursor-move text-white hover:bg-blue-500 transition-colors"
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
                        className="p-3 bg-blue-700/50 rounded-lg text-white min-h-[60px] flex items-center justify-center flex-wrap gap-2"
                      >
                        {target}: {selectedOptions.filter(opt => opt.target === target).length === 0 ? (
                          <span>(Kosong)</span>
                        ) : (
                          selectedOptions
                            .filter(opt => opt.target === target)
                            .map(opt => (
                              <div
                                key={opt.item}
                                className="p-2 bg-blue-500/50 rounded-lg cursor-pointer"
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
                    placeholder="Tuliskan jawaban kosmik mu..."
                    className="p-4 rounded-xl bg-blue-800/80 text-white border-2 border-blue-400/30 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-center text-lg transition-all duration-300"
                    disabled={showFeedback}
                    aria-label="Masukkan jawaban"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400">🌟</div>
                </div>
              </div>
            )}

            {currentQuestion.type === 'ceklis' && (
              <div className="space-y-4">
                <p className="text-blue-200 text-center font-semibold mb-4">Pilih semua jawaban yang benar:</p>
                {currentQuestion.options.map(option => (
                  <label key={option} className="flex items-center p-4 bg-blue-800/60 rounded-xl border border-blue-600/30 hover:bg-blue-700/60 transition-all duration-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedOptions(prev => [...prev, option]);
                        else setSelectedOptions(prev => prev.filter(o => o !== option));
                      }}
                      disabled={showFeedback}
                      className="w-5 h-5 text-blue-600 bg-blue-700 border-blue-400 rounded focus:ring-blue-400 mr-4"
                    />
                    <span className="text-white hover:text-blue-200 transition-colors duration-300">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {(currentQuestion.type === 'pg' || currentQuestion.type === 'ya-tidak') && (
              <div className="space-y-4">
                {currentQuestion.options.map(option => (
                  <label key={option} className="flex items-center p-4 bg-blue-800/60 rounded-xl border border-blue-600/30 hover:bg-blue-700/60 transition-all duration-300 cursor-pointer">
                    <input
                      type="radio"
                      name="question-answer"
                      value={option}
                      checked={userAnswer === option}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={showFeedback}
                      className="w-5 h-5 text-blue-600 bg-blue-700 border-blue-400 focus:ring-blue-400 mr-4"
                    />
                    <span className="text-white hover:text-blue-200 transition-colors duration-300">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={handleSubmitAnswer}
              disabled={showFeedback || 
                (currentQuestion.type === 'drag-and-drop' && selectedOptions.length !== currentQuestion.options.length) || 
                ((currentQuestion.type === 'ceklis' || currentQuestion.type === 'pg' || currentQuestion.type === 'ya-tidak') && selectedOptions.length === 0 && !userAnswer) ||
                (currentQuestion.type === 'isian-singkat' && !userAnswer.trim())
              }
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 text-lg border-2 border-blue-400/20"
              aria-label="Kirim jawaban"
            >
              <span className="flex items-center justify-center gap-2">
                ⚡ Aktifkan Cahaya Bintang ⚡
              </span>
            </button>
          </div>

          {showFeedback && (
            <div className={`mt-8 text-center transform animate-bounce ${result ? 'animate-pulse' : ''}`}>
              <div className={`inline-block p-6 rounded-2xl border-2 ${
                result 
                  ? 'bg-green-900/80 border-green-400/50 text-green-300' 
                  : 'bg-red-900/80 border-red-400/50 text-red-300'
              }`}>
                <div className="text-4xl mb-2">
                  {result ? '🎉' : '🌌'} 
                </div>
                <div className="text-2xl font-bold">
                  {result 
                    ? `✨ Hebat! Data bintang terungkap! ✨\n🏆 +${currentQuestion.score} XP Penjelajah! 🏆` 
                    : '🔄 Hmm, coba terbang lebih tinggi lagi... 🔄'
                  }
                </div>
                {result && (
                  <div className="text-green-200 mt-2 text-lg">
                    "Pengetahuan baru bersinar di langit malam!"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component to render the completion story
  const renderCompletionStory = () => (
    <div className="bg-gradient-to-r from-blue-900/90 to-cyan-800/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-blue-400/30 shadow-2xl text-center transform animate-pulse">
      <div className="text-6xl mb-6 animate-bounce">🌟</div>
      <h2 className="text-4xl font-bold text-blue-100 mb-4">Misi Langit Berhasil!</h2>
      <div className="bg-black/30 rounded-xl p-6 border border-blue-400/20">
        <p className="text-xl text-blue-50 leading-relaxed">
          Astra berhasil menjelajahi semua awan dan mengungkap rahasia data langit! 
          Cahaya bintang kini bersinar terang, menerangi jalan menuju petualangan kosmik berikutnya...
        </p>
      </div>
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={() => navigate ? navigate('/leaderboard') : console.log('Navigating to leaderboard...')}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-800 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-900 transform hover:scale-105 transition-all duration-300 text-lg border-2 border-blue-400/20"
          aria-label="Lihat Leaderboard"
        >
          🏅 Lihat Leaderboard
        </button>
        <button
          onClick={handlePlayAgain}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-cyan-700 transform hover:scale-105 transition-all duration-300 text-lg border-2 border-blue-400/20"
          aria-label="Main Lagi"
        >
          🔄 Terbang Lagi
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-black relative overflow-hidden font-inter">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 text-6xl animate-float">🌟</div>
        <div className="absolute top-40 right-20 text-4xl animate-float delay-1000">🌙</div>
        <div className="absolute bottom-20 left-1/4 text-5xl animate-float delay-2000">✨</div>
        <div className="absolute bottom-40 right-1/3 text-3xl animate-float delay-3000">☄️</div>
      </div>

      {renderCharacter()}

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {isLoading && (
            <div className="text-center text-white text-3xl space-y-4">
              <div className="animate-spin text-6xl">⚡</div>
              <div>Menjelajahi konstelasi data...</div>
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
                  setCharacterMessage('Mencoba terhubung kembali ke bintang-bintang...');
                  const fetchQuestions = async () => {
                    setIsLoading(true);
                    setError(null);
                    try {
                      const response = await fetch(`${API_URL}/api/questions/${missionId}`);
                      const data = await response.json();
                      if (response.ok) {
                        setQuestions(data.map((q, index) => ({ ...q, id: q.id || index + 1 })));
                        setCharacterMessage('Pilih awan untuk mulai menjelajahi langit!');
                      } else {
                        setError(data.error || 'Gagal memuat soal');
                        setCharacterMessage('Oh tidak, ada gangguan di angkasa!');
                      }
                    } catch (_) {
                      setError('Koneksi gagal. Silakan coba lagi.');
                      setCharacterMessage('Koneksi ke bintang-bintang terputus!');
                    } finally {
                      setIsLoading(false);
                    }
                  };
                  fetchQuestions();
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300"
                aria-label="Coba lagi"
              >
                🔄 Coba Terbang Lagi
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold text-blue-200 mb-6 drop-shadow-2xl">
                  🌌 Misi 2 – Rahasia Langit Kosmik 🌠
                </h1>
                <div className="bg-gradient-to-r from-blue-900/60 to-cyan-900/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/20 max-w-4xl mx-auto">
                  <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                    <span className="font-bold text-blue-300">Astra</span> harus menjelajahi rahasia data yang tersembunyi di awan-awan langit. 
                    Ayo bantu memilih <span className="text-blue-400 font-semibold">teknik pengumpulan data</span> yang tepat! 🔍✨
                  </p>
                </div>
              </div>

              {storyPhase === 'complete' ? renderCompletionStory() : 
                currentQuestion ? renderQuestion() : renderMysteryClouds()}
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

export default Mission2Diagram;