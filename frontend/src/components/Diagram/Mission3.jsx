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
          setQuestions(data.map((q, index) => ({
            ...q,
            id: q.id || index + 1,
            type: q.type.toLowerCase()
              .replace('isian singkat', 'isian-singkat')
              .replace('benar-salah', 'ya-tidak')
              // Keep 'menjodohkan' as is
          })));
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
      case 'pg': {
        isCorrect = userAnswer === currentQuestion.correct_answer; // e.g., 'B'
        break;
      }
      case 'ya-tidak': {
        isCorrect = userAnswer === currentQuestion.correct_answer; // e.g., 'Benar' or 'Ya'
        break;
      }
      case 'isian-singkat': {
        const normalizedUserAnswer = userAnswer.trim().replace(/\s+/g, '');
        const normalizedCorrectAnswer = currentQuestion.correct_answer.trim().replace(/\s+/g, '');
        isCorrect = normalizedUserAnswer.toLowerCase() === normalizedCorrectAnswer.toLowerCase(); // e.g., '[108,72,90,90]'
        break;
      }
      case 'menjodohkan': {
        const sortedSelected = [...selectedOptions].sort((a, b) => a.item.localeCompare(b.item));
        const sortedCorrect = Object.entries(currentQuestion.correct_answer)
          .map(([item, target]) => ({ item, target }))
          .sort((a, b) => a.item.localeCompare(b.item));
        isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
        break;
      }
      case 'gambar-isian': {
        isCorrect = userAnswer.trim() === currentQuestion.correct_answer.trim(); // e.g., '90'
        break;
      }
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
          setQuestions(data.map((q, index) => ({
            ...q,
            id: q.id || index + 1,
            type: q.type.toLowerCase()
              .replace('isian singkat', 'isian-singkat')
              .replace('benar-salah', 'ya-tidak')
          })));
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

  // Helper function to build asset URL (for both images and audio)
  const buildAssetUrl = (assetUrl) => {
    if (!assetUrl) return null;
    // Jika assetUrl sudah berisi path lengkap dengan /public/, gunakan apa adanya
    if (assetUrl.startsWith('/public/')) {
      return `${API_URL}${assetUrl}`;
    }
    // Jika hanya nama file, tambahkan /public/images/ untuk gambar atau /public/audio/ untuk audio (asumsi berdasarkan konteks)
    const basePath = assetUrl.endsWith('.mp3') || assetUrl.endsWith('.wav') ? '/public/audio/' : '/public/images/';
    return `${API_URL}${basePath}${assetUrl}`;
  };

  // Interactive character component
  const renderCharacter = () => (
    <div className="fixed z-20 flex flex-col items-end gap-4 bottom-10 right-10">
      <div className="max-w-xs p-4 border bg-blue-900/80 backdrop-blur-sm rounded-2xl border-blue-400/30">
        <p className="text-lg font-semibold text-white animate-pulse">{characterMessage}</p>
      </div>
      <div className="relative">
        <div className="text-6xl animate-bounce">🧙‍♂️</div>
        <div className="absolute text-2xl -top-2 -right-2 animate-spin">✨</div>
      </div>
    </div>
  );

  // Component to render the introduction story
  const renderStoryIntro = () => (
    <div className="bg-gradient-to-r from-blue-900/90 to-indigo-800/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-blue-400/30 shadow-2xl mb-12 transform hover:scale-[1.02] transition-all duration-500">
      <div className="flex items-center justify-center mb-6">
        <div className="text-6xl animate-bounce">🌌</div>
      </div>
      <div className="space-y-4 text-center">
        <h2 className="mb-4 text-3xl font-bold text-blue-100">📜 Petualangan Langit Dimulai...</h2>
        <div className="p-6 border bg-black/30 rounded-xl border-blue-400/20">
          <p className="text-lg leading-relaxed text-blue-50">
            <span className="font-bold text-blue-300">Astra</span> melayang di antara bintang-bintang di langit malam yang luas. 
            Kabut kosmik menyembunyikan <span className="font-semibold text-blue-400">rahasia representasi data</span> di dalam awan-awan misterius.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-blue-50">
            "Aku harus menjelajahi setiap awan dengan hati-hati," gumam Astra sambil memegang tongkat bintang. 
            <span className="font-semibold text-blue-400">"Setiap pertanyaan yang terjawab akan membuka rahasia kosmos!"</span>
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
        
        <div className="p-10 border-2 shadow-2xl bg-gradient-to-b from-blue-900/80 to-indigo-900/80 backdrop-blur-sm rounded-3xl border-blue-400/30">
          <div className="mb-10 text-center">
            <div className="mb-6 text-5xl">✈️ 🌌 ✈️</div>
            <h3 className="mb-4 text-3xl font-bold text-blue-100">Petualangan Langit Misterius</h3>
            <p className="text-lg text-blue-200/80">Pilih awan untuk mulai menjelajahi rahasia langit!</p>
          </div>

          <div className="grid max-w-5xl grid-cols-1 gap-8 mx-auto sm:grid-cols-2 md:grid-cols-3">
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
                  <div className="absolute text-blue-400 top-4 right-4 animate-pulse opacity-60">🌟</div>
                  <div className="absolute text-blue-300 delay-300 bottom-4 left-4 animate-pulse opacity-40">✨</div>
                  
                  <div className="relative z-10 text-center">
                    <div className="mb-4 text-5xl transition-transform duration-300 transform group-hover:scale-110">
                      {isFlying ? '⚡' : layer.icon}
                    </div>
                    <div className="mb-2 text-xl font-bold text-white">{layer.name}</div>
                    <div className="text-sm text-blue-300 opacity-80">{layer.altitude}</div>
                  </div>
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-blue-400/0 via-blue-400/10 to-blue-400/0 group-hover:opacity-100 rounded-2xl"></div>
                </button>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <div className="inline-block p-6 rounded-full bg-blue-800/50">
              <div className="text-xl font-semibold text-blue-300">
                🌠 Kemajuan Penjelajahan: {Object.keys(answeredQuestions).length}/{questions.length}
              </div>
              <div className="h-4 mx-auto mt-4 overflow-hidden bg-blue-700 rounded-full w-80">
                <div 
                  className="h-full transition-all duration-1000 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-cyan-400"
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
      <div className="relative w-full max-w-3xl p-8 mx-auto overflow-hidden border-2 shadow-2xl bg-gradient-to-br from-blue-900/95 to-indigo-900/95 backdrop-blur-sm rounded-3xl border-blue-400/30">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute text-5xl top-6 left-6 animate-pulse">🌟</div>
          <div className="absolute text-3xl delay-300 top-6 right-6 animate-bounce">✨</div>
          <div className="absolute text-4xl delay-700 transform -translate-x-1/2 bottom-6 left-1/2 animate-pulse">🌌</div>
        </div>

        <div className="relative z-10">
          <div className="mb-8 text-center">
            <div className="mb-4 text-5xl animate-bounce">⭐</div>
            <h3 className="mb-2 text-3xl font-bold text-blue-200">Bintang Data Ditemukan!</h3>
            <div className="p-4 border bg-blue-900/30 rounded-xl border-blue-400/20">
              <p className="text-sm text-blue-100">Astra menemukan konstelasi berisi pertanyaan misterius...</p>
            </div>
          </div>

          <div className="p-6 mb-6 border bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-2xl border-blue-400/20">
            <p className="text-xl font-semibold leading-relaxed text-center text-white whitespace-pre-line">
              {currentQuestion.question_text}
            </p>
            {currentQuestion.audio_url && (
              <div className="flex justify-center mt-4">
                <audio controls src={buildAssetUrl(currentQuestion.audio_url)} className="w-full max-w-sm" />
              </div>
            )}
            {currentQuestion.image_url && currentQuestion.type === 'gambar-isian' && (
              <div className="flex justify-center mt-4">
                <img src={buildAssetUrl(currentQuestion.image_url)} alt="Question Image" className="h-auto max-w-full rounded-lg shadow-md" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            {currentQuestion.type === 'pg' && (
              <div className="space-y-4">
                <p className="mb-4 text-center text-blue-200">Pilih diagram batang yang sesuai dengan data penjualan buah:</p>
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center p-4 transition-all duration-300 border cursor-pointer bg-blue-800/60 rounded-xl border-blue-600/30 hover:bg-blue-700/60"
                  >
                    <input
                      type="radio"
                      name="question-answer"
                      value={key}
                      checked={userAnswer === key}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={showFeedback}
                      className="w-5 h-5 mr-4 text-blue-600 bg-blue-700 border-blue-400 focus:ring-blue-400"
                    />
                    <img
                      src={value}
                      alt={`Option ${key}`}
                      className="w-24 h-auto rounded-lg"
                    />
                    <span className="ml-4 text-white transition-colors duration-300 hover:text-blue-200">{key}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'ya-tidak' && (
              <div className="space-y-4">
                <p className="mb-4 text-center text-blue-200">
                  {currentQuestion.question_text.includes('panen padi') 
                    ? 'Apakah diagram garis cocok untuk data panen padi?' 
                    : 'Apakah perhitungan persentase kegiatan ekstrakurikuler benar?'}
                </p>
                {currentQuestion.options.map(option => (
                  <label
                    key={option}
                    className="flex items-center p-4 transition-all duration-300 border cursor-pointer bg-blue-800/60 rounded-xl border-blue-600/30 hover:bg-blue-700/60"
                  >
                    <input
                      type="radio"
                      name="question-answer"
                      value={option}
                      checked={userAnswer === option}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={showFeedback}
                      className="w-5 h-5 mr-4 text-blue-600 bg-blue-700 border-blue-400 focus:ring-blue-400"
                    />
                    <span className="text-white transition-colors duration-300 hover:text-blue-200">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'isian-singkat' && (
              <div className="text-center">
                <p className="mb-4 text-blue-200">Masukkan sudut derajat untuk setiap aktivitas (format: [jawaban 1,jawaban 2,jawaban 3,jawaban 4]):</p>
                <div className="relative">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Tuliskan jawaban kosmik mu..."
                    className="w-full max-w-md p-4 text-lg text-center text-white transition-all duration-300 border-2 rounded-xl bg-blue-800/80 border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    disabled={showFeedback}
                    aria-label="Masukkan jawaban"
                  />
                  <div className="absolute text-blue-400 transform -translate-y-1/2 right-4 top-1/2">🌟</div>
                </div>
              </div>
            )}

            {currentQuestion.type === 'menjodohkan' && (
              <div className="text-center">
                <p className="mb-4 text-blue-200">Pasangkan data dengan jenis diagram yang sesuai:</p>
                <div className="flex flex-col items-center space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {currentQuestion.options
                      .filter(item => !selectedOptions.some(opt => opt.item === item))
                      .map(item => (
                        <div
                          key={item}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', item)}
                          className="p-3 text-white transition-colors rounded-lg cursor-move bg-blue-600/50 hover:bg-blue-500"
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
                                className="p-2 rounded-lg cursor-pointer bg-blue-500/50"
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

            {currentQuestion.type === 'gambar-isian' && (
              <div className="text-center">
                <p className="mb-4 text-blue-200">Masukkan besar sudut untuk siswa yang naik sepeda (hanya angka):</p>
                <div className="relative">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Tuliskan jawaban kosmik mu..."
                    className="w-full max-w-md p-4 text-lg text-center text-white transition-all duration-300 border-2 rounded-xl bg-blue-800/80 border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    disabled={showFeedback}
                    aria-label="Masukkan jawaban"
                  />
                  <div className="absolute text-blue-400 transform -translate-y-1/2 right-4 top-1/2">🌟</div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleSubmitAnswer}
              disabled={
                showFeedback ||
                (currentQuestion.type === 'menjodohkan' && selectedOptions.length !== currentQuestion.options.length) ||
                ((currentQuestion.type === 'pg' || currentQuestion.type === 'ya-tidak') && !userAnswer) ||
                ((currentQuestion.type === 'isian-singkat' || currentQuestion.type === 'gambar-isian') && !userAnswer.trim())
              }
              className="px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform border-2 shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border-blue-400/20"
              aria-label="Kirim jawaban"
            >
              <span className="flex items-center justify-center gap-2">
                ⚡ Aktifkan Cahaya Bintang ⚡
              </span>
            </button>
          </div>

          {showFeedback && (
            <div className={`mt-8 text-center transform animate-bounce ${result ? 'animate-pulse' : ''}`}>
              <div
                className={`inline-block p-6 rounded-2xl border-2 ${
                  result
                    ? 'bg-green-900/80 border-green-400/50 text-green-300'
                    : 'bg-red-900/80 border-red-400/50 text-red-300'
                }`}
              >
                <div className="mb-2 text-4xl">{result ? '🎉' : '🌌'}</div>
                <div className="text-2xl font-bold">
                  {result
                    ? `✨ Hebat! Data bintang terungkap! ✨\n🏆 +${currentQuestion.score} XP Penjelajah! 🏆`
                    : '🔄 Hmm, coba terbang lebih tinggi lagi... 🔄'}
                </div>
                {result && (
                  <div className="mt-2 text-lg text-green-200">
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
    <div className="p-8 text-center transform border-2 shadow-2xl bg-gradient-to-r from-blue-900/90 to-cyan-800/90 backdrop-blur-sm rounded-3xl border-blue-400/30 animate-pulse">
      <div className="mb-6 text-6xl animate-bounce">🌟</div>
      <h2 className="mb-4 text-4xl font-bold text-blue-100">Misi Langit Berhasil!</h2>
      <div className="p-6 border bg-black/30 rounded-xl border-blue-400/20">
        <p className="text-xl leading-relaxed text-blue-50">
          Astra berhasil menjelajahi semua awan dan mengungkap rahasia representasi data! 
          Cahaya bintang kini bersinar terang, menerangi jalan menuju petualangan kosmik berikutnya...
        </p>
      </div>
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => navigate ? navigate('/leaderboard') : console.log('Navigating to leaderboard...')}
          className="px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform border-2 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-800 rounded-xl hover:from-blue-700 hover:to-indigo-900 hover:scale-105 border-blue-400/20"
          aria-label="Lihat Leaderboard"
        >
          🏅 Lihat Leaderboard
        </button>
        <button
          onClick={handlePlayAgain}
          className="px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform border-2 shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:from-blue-700 hover:to-cyan-700 hover:scale-105 border-blue-400/20"
          aria-label="Main Lagi"
        >
          🔄 Terbang Lagi
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-black font-inter">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute text-6xl top-20 left-10 animate-float">🌟</div>
        <div className="absolute text-4xl delay-1000 top-40 right-20 animate-float">🌙</div>
        <div className="absolute text-5xl bottom-20 left-1/4 animate-float delay-2000">✨</div>
        <div className="absolute text-3xl bottom-40 right-1/3 animate-float delay-3000">☄️</div>
      </div>
      
      <div className="fixed z-20 top-4 left-4">
        <button
          onClick={() => (window.location.href = '/diagram')}
          className="group relative px-4 py-2 bg-gradient-to-r from-amber-600/80 to-orange-700/80 rounded-lg text-amber-200 font-semibold text-sm shadow-[0_4px_12px_rgba(255,107,0,0.3)] hover:-translate-y-1 transition-all duration-300"
        >
          <span className="relative z-10">← Kembali</span>
          <div className="absolute inset-0 transition-opacity duration-300 rounded-lg opacity-0 bg-amber-500/30 group-hover:opacity-100" />
        </button>
      </div>
      
      {renderCharacter()}

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {isLoading && (
            <div className="space-y-4 text-3xl text-center text-white">
              <div className="text-6xl animate-spin">⚡</div>
              <div>Menjelajahi konstelasi data...</div>
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
                  setCharacterMessage('Mencoba terhubung kembali ke bintang-bintang...');
                  const fetchQuestions = async () => {
                    setIsLoading(true);
                    setError(null);
                    try {
                      const response = await fetch(`${API_URL}/api/questions/${missionId}`);
                      const data = await response.json();
                      if (response.ok) {
                        setQuestions(data.map((q, index) => ({
                          ...q,
                          id: q.id || index + 1,
                          type: q.type.toLowerCase()
                            .replace('isian singkat', 'isian-singkat')
                            .replace('benar-salah', 'ya-tidak')
                        })));
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
                className="px-6 py-3 text-white transition-all duration-300 bg-blue-600 rounded-xl hover:bg-blue-700"
                aria-label="Coba lagi"
              >
                🔄 Coba Terbang Lagi
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className="mb-12 text-center">
                <h1 className="mb-6 text-5xl font-bold text-blue-200 md:text-6xl drop-shadow-2xl">
                  🌌 Misi 6 – Rahasia Representasi Data Kosmik 🌠
                </h1>
                <div className="max-w-4xl p-6 mx-auto border bg-gradient-to-r from-blue-900/60 to-cyan-900/60 backdrop-blur-sm rounded-2xl border-blue-400/20">
                  <p className="text-xl leading-relaxed text-blue-100 md:text-2xl">
                    <span className="font-bold text-blue-300">Astra</span> harus menjelajahi rahasia representasi data yang tersembunyi di awan-awan langit. 
                    Ayo bantu memilih <span className="font-semibold text-blue-400">diagram yang tepat</span>! 🔍✨
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