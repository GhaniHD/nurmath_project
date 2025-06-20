import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const Mission1 = ({ missionId, onComplete }) => {
  // State declarations
  const [allQuestions, setAllQuestions] = useState([]);
  const [questionsByTopic, setQuestionsByTopic] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState(() => {
    const saved = localStorage.getItem(`answeredQuestions_${missionId}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [spinning, setSpinning] = useState(false);
  const [spinResultTopic, setSpinResultTopic] = useState(null);
  const [result, setResult] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [userMatchingAnswers, setUserMatchingAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioError, setAudioError] = useState(null);
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [showNameModal, setShowNameModal] = useState(!localStorage.getItem('userName'));
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [wheelVisualRotation, setWheelVisualRotation] = useState(0);
  const [spinDurationCss, setSpinDurationCss] = useState('0s');
  const [spinTimingFunction, setSpinTimingFunction] = useState('ease-out');

  // Refs and hooks
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Constants
  const spinwheelOptionsMap = useMemo(() => ({
    'pg': 'Pilihan Ganda',
    'benar-salah': 'Benar/Salah',
    'audio-isian': 'Soal Audio',
    'menjodohkan': 'Menjodohkan Teks',
    'uraian': 'Uraian Singkat',
    'gambar-isian': 'Gambar + Isian'
  }), []);

  // Helper functions
  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

  const levenshteinDistance = (a, b) => {
    const matrix = Array(b.length + 1).fill().map((_, i) => Array(a.length + 1).fill(i));
    for (let j = 1; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + (a[j - 1] !== b[i - 1] ? 1 : 0)
        );
      }
    }
    return matrix[b.length][a.length];
  };

  // Derived values
  const getAvailableSpinOptions = useCallback(() => {
    return Object.keys(questionsByTopic).filter(type => {
      const remainingQuestionsOfType = questionsByTopic[type].filter(q => !answeredQuestions[q.id]);
      return remainingQuestionsOfType.length > 0;
    }).map(type => spinwheelOptionsMap[type]);
  }, [questionsByTopic, answeredQuestions, spinwheelOptionsMap]);

  // Effects
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/questions/${missionId}`);
        const data = await response.json();
        if (response.ok) {
          setAllQuestions(data);
          const organized = {};
          data.forEach(q => {
            if (!organized[q.type]) organized[q.type] = [];
            organized[q.type].push(q);
          });
          Object.keys(organized).forEach(type => {
            organized[type] = shuffleArray(organized[type]);
          });
          setQuestionsByTopic(organized);
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
  }, [missionId, API_URL]);

  useEffect(() => {
    localStorage.setItem(`answeredQuestions_${missionId}`, JSON.stringify(answeredQuestions));
  }, [answeredQuestions, missionId]);

  useEffect(() => {
    if (allQuestions.length > 0) {
      const totalQuestionsCount = allQuestions.length;
      const answeredCount = Object.keys(answeredQuestions).length;

      if (answeredCount > 0 && answeredCount === totalQuestionsCount) {
        setMissionCompleted(true);
      }
    }
  }, [answeredQuestions, allQuestions.length]);

  useEffect(() => {
    if (currentQuestion?.type === 'audio-isian' && audioRef.current && currentQuestion.audio_url) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {
        setAudioError('Gagal memutar audio. Gunakan kontrol audio untuk memutar.');
      });
    }
  }, [currentQuestion]);

  // Event handlers
  const retryFetch = () => {
    setError(null);
    setIsLoading(true);
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/questions/${missionId}`);
        const data = await response.json();
        if (response.ok) {
          setAllQuestions(data);
          const organized = {};
          data.forEach(q => {
            if (!organized[q.type]) organized[q.type] = [];
            organized[q.type].push(q);
          });
          Object.keys(organized).forEach(type => {
            organized[type] = shuffleArray(organized[type]);
          });
          setQuestionsByTopic(organized);
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

  const resetQuestionState = useCallback(() => {
    setResult(null);
    setUserAnswer('');
    setUserMatchingAnswers({});
    setShowFeedback(false);
    setCurrentQuestion(null);
    setSpinResultTopic(null);
    setSpinDurationCss('0s');
    setSpinTimingFunction('ease-out');
    setWheelVisualRotation(0);
    setAudioError(null);
  }, []);

  const resetMission = useCallback(() => {
    setAnsweredQuestions({});
    setMissionCompleted(false);
    resetQuestionState();
    localStorage.removeItem(`answeredQuestions_${missionId}`);
  }, [missionId, resetQuestionState]);

  const handleSpin = useCallback(() => {
    if (!userName) {
      setShowNameModal(true);
      return;
    }
    const availableOptions = getAvailableSpinOptions();
    if (availableOptions.length === 0) {
      setMissionCompleted(true);
      return;
    }

    if (availableOptions.length === 1) {
      const selectedTopicText = availableOptions[0];
      const selectedTypeKey = Object.keys(spinwheelOptionsMap).find(
        key => spinwheelOptionsMap[key] === selectedTopicText
      );
      if (selectedTypeKey) {
        const questionsOfType = questionsByTopic[selectedTypeKey] || [];
        const unansweredQuestionsOfType = questionsOfType.filter(q => !answeredQuestions[q.id]);
        if (unansweredQuestionsOfType.length > 0) {
          const randomQuestionIndex = Math.floor(Math.random() * unansweredQuestionsOfType.length);
          setCurrentQuestion(unansweredQuestionsOfType[randomQuestionIndex]);
        }
      }
      return;
    }

    setSpinning(true);
    setSpinResultTopic(null);

    const fastSpinDuration = 1000;
    const slowDownDuration = 2000;

    const randomIndex = Math.floor(Math.random() * availableOptions.length);
    const selectedTopicText = availableOptions[randomIndex];
    const numSegments = availableOptions.length;
    const segmentAngle = 360 / numSegments;

    const selectedSegmentCenterAngle = (randomIndex * segmentAngle) + (segmentAngle / 2);
    let finalAngle = 360 - selectedSegmentCenterAngle;
    finalAngle += (360 * 5);

    setSpinTimingFunction('linear');
    setSpinDurationCss(`${fastSpinDuration}ms`);
    setWheelVisualRotation(360 * 3);

    setTimeout(() => {
      setSpinTimingFunction('cubic-bezier(0.25, 0.1, 0.25, 1.0)');
      setSpinDurationCss(`${slowDownDuration}ms`);
      setWheelVisualRotation(finalAngle);

      setTimeout(() => {
        setSpinResultTopic(selectedTopicText);
        const selectedTypeKey = Object.keys(spinwheelOptionsMap).find(
          key => spinwheelOptionsMap[key] === selectedTopicText
        );
        if (selectedTypeKey) {
          const questionsOfType = questionsByTopic[selectedTypeKey] || [];
          const unansweredQuestionsOfType = questionsOfType.filter(q => !answeredQuestions[q.id]);
          if (unansweredQuestionsOfType.length > 0) {
            const randomQuestionIndex = Math.floor(Math.random() * unansweredQuestionsOfType.length);
            setCurrentQuestion(unansweredQuestionsOfType[randomQuestionIndex]);
          } else {
            resetQuestionState();
          }
        }
        setSpinning(false);
      }, slowDownDuration);
    }, fastSpinDuration);
  }, [
    userName,
    getAvailableSpinOptions,
    spinwheelOptionsMap,
    questionsByTopic,
    answeredQuestions,
    resetQuestionState
  ]);

  const handleSubmitAnswer = async (answer) => {
    if (!currentQuestion) return;

    let isCorrect = false;
    switch (currentQuestion.type) {
      case 'pg':
      case 'benar-salah':
        isCorrect = answer === currentQuestion.correct_answer;
        break;
      case 'audio-isian':
        isCorrect = answer.trim().toLowerCase() === currentQuestion.correct_answer.trim().toLowerCase();
        break;
      case 'uraian': {
        const correctKeywords = currentQuestion.correct_answer.toLowerCase().split(',').map(k => k.trim());
        const userKeywords = answer.toLowerCase().split(/[\s,.;]+/).map(k => k.trim()).filter(k => k);
        const synonymMap = {
          wawancara: ['interview'],
          observasi: ['pengamatan', 'observation'],
          kuesioner: ['angket', 'questionnaire'],
          eksperimen: ['percobaan', 'experiment'],
          'studi pustaka': ['literatur', 'kajian pustaka', 'library research']
        };
        let matchedCount = 0;
        correctKeywords.forEach(correct => {
          const synonyms = synonymMap[correct] || [];
          if (
            userKeywords.includes(correct) ||
            synonyms.some(synonym => userKeywords.includes(synonym)) ||
            userKeywords.some(user => levenshteinDistance(user, correct) <= 2)
          ) {
            matchedCount++;
          }
        });
        isCorrect = matchedCount >= Math.ceil(correctKeywords.length * 0.8);
        break;
      }
      case 'gambar-isian':
        isCorrect = answer.toLowerCase() === currentQuestion.correct_answer.toLowerCase();
        break;
      case 'menjodohkan': {
        const sortedUserAnswers = Object.keys(answer).sort().reduce((obj, key) => {
          obj[key] = answer[key];
          return obj;
        }, {});
        const sortedCorrectAnswers = Object.keys(currentQuestion.correct_answer).sort().reduce((obj, key) => {
          obj[key] = currentQuestion.correct_answer[key];
          return obj;
        }, {});
        isCorrect = JSON.stringify(sortedUserAnswers) === JSON.stringify(sortedCorrectAnswers);
        break;
      }
      default:
        isCorrect = false;
    }

    setResult(isCorrect);
    setShowFeedback(true);
    const score = isCorrect ? currentQuestion.score : 0;

    if (onComplete) {
      onComplete(score, missionId);
    }

    setAnsweredQuestions(prev => ({ ...prev, [currentQuestion.id]: true }));
    setTimeout(() => {
      resetQuestionState();
    }, 1500);
  };

  const handleMatchingChange = (item, target) => {
    setUserMatchingAnswers(prev => ({ ...prev, [item]: target }));
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    if (name) {
      setUserName(name);
      localStorage.setItem('userName', name);
      setShowNameModal(false);
    } else {
      alert('Masukkan nama terlebih dahulu!');
    }
  };

  // Render functions
  const renderStoryIntro = () => (
    <div className="bg-gradient-to-r from-red-900/90 to-orange-800/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-orange-600/30 shadow-2xl mb-12 transform hover:scale-[1.02] transition-all duration-500">
      <div className="flex items-center justify-center mb-6">
        <div className="text-6xl animate-bounce">🌋</div>
      </div>
      <div className="space-y-4 text-center">
        <h2 className="mb-4 text-3xl font-bold text-orange-100">📜 Kisah Dimulai...</h2>
        <div className="p-6 border bg-black/30 rounded-xl border-orange-600/20">
          <p className="text-lg leading-relaxed text-orange-50">
            <span className="font-bold text-orange-300">{userName || 'NurM'}</span> mendaki puncak Gunung Pengetahuan yang masih berasap. 
            Letusan purba telah memecah batuan ilmu menjadi kristal data yang berserakan di lereng berapi.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-orange-50">
            "Aku harus memutar Roda Batu Bercahaya untuk mengumpulkan kristal-kristal ini," tekad NurM sambil memegang obor petualang. 
            <span className="font-semibold text-blue-400">"Setiap teka-teki yang terpecahkan akan menyatukan kembali kebijaksanaan kuno!"</span>
          </p>
        </div>
      </div>
    </div>
  );

  const renderSpinwheel = () => {
    const availableOptions = getAvailableSpinOptions();
    const numSegments = availableOptions.length;

    if (numSegments === 0 && allQuestions.length > 0) {
      return null; // Handled by missionCompleted
    }
    if (numSegments === 0 && allQuestions.length === 0) {
      return null; // Handled by isLoading
    }

    const colors = [
      'fill-stone-700', 'fill-red-800', 'fill-orange-700', 'fill-amber-700', 'fill-yellow-600',
      'fill-stone-600', 'fill-red-700', 'fill-orange-600', 'fill-amber-600', 'fill-yellow-700',
    ];

    const viewBoxSize = 500;

    return (
      <div className="space-y-12">
        {renderStoryIntro()}
        <div className="p-10 border-2 shadow-2xl bg-gradient-to-br from-slate-900/95 to-stone-900/95 backdrop-blur-sm rounded-3xl border-amber-600/30">
          <div className="mb-10 text-center">
            <div className="mb-6 text-5xl">🌋 🔮 🌋</div>
            <h3 className="mb-4 text-3xl font-bold text-amber-100">Roda Batu Bercahaya</h3>
            <p className="text-lg text-amber-200/80">Putar roda untuk memilih kristal ilmu!</p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[500px] aspect-square">
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ 
                  transform: `rotate(${wheelVisualRotation}deg)`,
                  transition: `transform ${spinDurationCss} ${spinTimingFunction}`,
                  filter: 'drop-shadow(0 0 15px rgba(255,167,38,0.4))'
                }}
                aria-label="Roda Batu Bercahaya"
              >
                {availableOptions.map((option, index) => {
                  const startAngle = index * (360 / numSegments);
                  const endAngle = startAngle + (360 / numSegments);
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;
                  const radius = viewBoxSize / 2 - 10;
                  const center = viewBoxSize / 2;
                  const x1 = center + radius * Math.cos(startRad);
                  const y1 = center + radius * Math.sin(startRad);
                  const x2 = center + radius * Math.cos(endRad);
                  const y2 = center + radius * Math.sin(endRad);
                  const largeArcFlag = (360 / numSegments) > 180 ? 1 : 0;

                  const textAngle = (startAngle + (360 / numSegments) / 2) * (Math.PI) / 180;
                  const textRadius = radius * 0.65;
                  const textX = center + textRadius * Math.cos(textAngle);
                  const textY = center + textRadius * Math.sin(textAngle);

                  return (
                    <g key={index}>
                      <path
                        d={`M ${center},${center} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`}
                        className={`${colors[index % colors.length]} hover:brightness-110 transition-all duration-300`}
                        stroke="black"
                        strokeWidth="4"
                      />
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        fill="white"
                        fontSize={numSegments > 6 ? "16" : "20"}
                        fontWeight="bold"
                        transform={`rotate(${startAngle + (360 / numSegments) / 2}, ${textX}, ${textY})`}
                        className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]"
                      >
                        {option}
                      </text>
                    </g>
                  );
                })}
                <circle cx={viewBoxSize / 2} cy={viewBoxSize / 2} r="30" fill="black" stroke="amber-600" strokeWidth="4" />
              </svg>

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,167,38,0.6)] hover:scale-110 transition-transform duration-300 z-20">
                <button
                  onClick={handleSpin}
                  disabled={spinning}
                  className="flex items-center justify-center w-full h-full text-white disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-amber-500"
                  aria-label="Putar roda"
                  aria-disabled={spinning}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643L18.75 12l-11.47 7.99C6.029 20.65 4.5 19.74 4.5 18.347V5.653Z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {spinResultTopic && !spinning && (
              <div className="mt-8 text-center">
                <div className="text-3xl font-bold text-amber-200 animate-pulse">
                  Kristal Ilmu Terpilih: {spinResultTopic}!
                </div>
                <button 
                  onClick={() => setSpinResultTopic(null)} 
                  className="px-8 py-4 mt-4 font-bold text-white transition-all duration-300 transform shadow-lg bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl hover:from-amber-700 hover:to-yellow-700 hover:scale-105"
                  aria-label="Lanjutkan ke soal"
                >
                  Lanjutkan ke Soal
                </button>
              </div>
            )}
          </div>

          <div className="mt-10 text-center">
            <div className="inline-block p-6 rounded-full bg-stone-800/50">
              <div className="text-xl font-semibold text-amber-300">
                📊 Kemajuan Pengumpulan: {Object.keys(answeredQuestions).length}/{allQuestions.length}
              </div>
              <div className="h-4 mx-auto mt-4 overflow-hidden rounded-full w-80 bg-stone-700">
                <div 
                  className="h-full transition-all duration-1000 rounded-full shadow-lg bg-gradient-to-r from-amber-500 to-yellow-400"
                  style={{ width: `${(Object.keys(answeredQuestions).length / allQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestionUI = () => {
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
            <div className="mb-4 text-5xl animate-bounce">💎</div>
            <h3 className="mb-2 text-3xl font-bold text-amber-200">Kristal Ilmu Ditemukan!</h3>
            <div className="p-4 border bg-amber-900/30 rounded-xl border-amber-600/20">
              <p className="text-sm text-amber-100">{userName || 'NurM'} menemukan kristal bercahaya berisi teka-teki kuno...</p>
            </div>
          </div>

          <div className="p-6 mb-6 border bg-gradient-to-r from-amber-900/40 to-yellow-900/40 rounded-2xl border-amber-500/20">
            <p className="text-xl font-semibold leading-relaxed text-center text-white whitespace-pre-line">
              {currentQuestion.question_text}
            </p>
          </div>

          <div className="space-y-6">
            {currentQuestion.type === 'audio-isian' && currentQuestion.audio_url ? (
              <div className="mb-6 text-center">
                {audioError ? (
                  <div className="mb-4 text-red-300">{audioError}</div>
                ) : (
                  <audio
                    ref={audioRef}
                    src={currentQuestion.audio_url}
                    controls
                    className="w-full max-w-md mx-auto mb-4"
                    onError={() => setAudioError('Audio tidak dapat dimuat. Silakan periksa file atau coba lagi.')}
                  />
                )}
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.play().catch(() => {
                        setAudioError('Gagal memutar audio. Gunakan kontrol audio untuk memutar.');
                      });
                    }
                  }}
                  className="px-6 py-3 text-white transition-all duration-300 transform shadow-lg bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl hover:from-amber-700 hover:to-yellow-700 hover:scale-105"
                  aria-label="Putar ulang audio"
                  disabled={audioError}
                >
                  Putar Ulang Audio
                </button>
              </div>
            ) : currentQuestion.type === 'audio-isian' ? (
              <div className="mb-6 text-center text-red-300">
                Audio tidak tersedia untuk soal ini.
              </div>
            ) : null}

            {(() => {
              switch (currentQuestion.type) {
                case 'pg':
                case 'benar-salah':
                  return (
                    <div className="space-y-4">
                      {currentQuestion.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSubmitAnswer(option)}
                          className={`w-full p-4 bg-slate-800/60 rounded-xl border border-slate-600/30 text-white hover:bg-slate-700/60 hover:text-amber-200 transition-all duration-300
                            ${showFeedback ? (option === currentQuestion.correct_answer ? 'bg-green-900/80 border-green-500/50' : 'bg-red-900/80 border-red-500/50') : ''}`}
                          disabled={showFeedback}
                          aria-label={`Pilih jawaban ${option}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  );
                case 'audio-isian':
                case 'gambar-isian':
                  return (
                    <div className="text-center">
                      {currentQuestion.type === 'gambar-isian' && currentQuestion.image_url && (
                        <img src={currentQuestion.image_url} alt="Ilustrasi Kristal" className="mb-6 max-w-sm mx-auto rounded-xl shadow-[0_0_15px_rgba(255,167,38,0.4)]" />
                      )}
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
                  );
                case 'menjodohkan':
                  return (
                    <div className="text-center">
                      <div className="flex flex-col max-w-xl gap-4 mx-auto">
                        {currentQuestion.options.map((item, idx) => (
                          <div key={idx} className="flex flex-col items-center justify-between p-4 text-white border sm:flex-row bg-slate-800/60 rounded-xl border-slate-600/30">
                            <span className="flex-1 mb-2 text-left whitespace-pre-line sm:mb-0">{item}</span>
                            <select
                              value={userMatchingAnswers[item] || ''}
                              onChange={(e) => handleMatchingChange(item, e.target.value)}
                              className="w-full p-3 text-white border-2 rounded-xl bg-slate-800/80 border-amber-600/30 sm:w-auto focus:outline-none focus:ring-2 focus:ring-amber-500"
                              disabled={showFeedback}
                              aria-label={`Pilih kategori untuk ${item}`}
                            >
                              <option value="">Pilih Kategori</option>
                              {currentQuestion.targets.map((target, targetIdx) => (
                                <option key={targetIdx} value={target}>{target}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                case 'uraian':
                  return (
                    <div className="text-center">
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Tulis jawaban di sini (pisahkan dengan koma jika ada beberapa jawaban kunci)..."
                        rows="4"
                        className="w-full p-4 text-white border-2 rounded-xl bg-slate-800/80 border-amber-600/30 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        disabled={showFeedback}
                        aria-label="Masukkan jawaban uraian"
                      />
                    </div>
                  );
                default:
                  return <p className="text-red-300">Tipe soal tidak dikenal.</p>;
              }
            })()}

            {(currentQuestion.type === 'audio-isian' || currentQuestion.type === 'gambar-isian' || currentQuestion.type === 'uraian' || currentQuestion.type === 'menjodohkan') && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => handleSubmitAnswer(currentQuestion.type === 'menjodohkan' ? userMatchingAnswers : userAnswer)}
                  disabled={showFeedback || 
                    (currentQuestion.type === 'menjodohkan' && Object.keys(userMatchingAnswers).length !== currentQuestion.options.length) || 
                    (['audio-isian', 'gambar-isian', 'uraian'].includes(currentQuestion.type) && !userAnswer.trim())}
                  className="px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform border-2 shadow-lg bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl hover:from-amber-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border-amber-500/20"
                  aria-label="Kirim jawaban"
                >
                  <span className="flex items-center justify-center gap-2">
                    ⚡ Aktifkan Mantra Data ⚡
                  </span>
                </button>
              </div>
            )}

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
                      ? `✨ Hebat! Kristal ilmu terkumpul! ✨\n🏆 +${currentQuestion.score} XP Penjelajah! 🏆` 
                      : '🔄 Hmm, coba kumpulkan lagi... 🔄'
                    }
                  </div>
                  {result && (
                    <div className="mt-2 text-lg text-green-200">
                      "Serpihan pengetahuan telah tersusun kembali!"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCompletionStory = () => (
    <div className="p-8 text-center transform border-2 shadow-2xl bg-gradient-to-r from-green-900/90 to-emerald-800/90 backdrop-blur-sm rounded-3xl border-green-500/30 animate-pulse">
      <div className="mb-6 text-6xl animate-bounce">🏆</div>
      <h2 className="mb-4 text-4xl font-bold text-green-100">Misi Berhasil Diselesaikan!</h2>
      <div className="p-6 border bg-black/30 rounded-xl border-green-500/20">
        <p className="text-xl leading-relaxed text-green-50">
          {userName || 'NurM'} berhasil mengumpulkan semua kristal ilmu dan menyatukan kembali pengetahuan yang retak! 
          Cahaya kebijaksanaan kini bersinar dari puncak gunung, menerangi jalan menuju petualangan data berikutnya...
        </p>
      </div>
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => navigate('/leaderboard')}
          className="px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform border-2 shadow-lg bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl hover:from-blue-700 hover:to-blue-900 hover:scale-105 border-blue-500/20"
          aria-label="Lihat Leaderboard"
        >
          🏅 Lihat Leaderboard
        </button>
        <button
          onClick={resetMission}
          className="px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform border-2 shadow-lg bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl hover:from-amber-700 hover:to-yellow-700 hover:scale-105 border-amber-500/20"
          aria-label="Main Lagi"
        >
          🔄 Main Lagi
        </button>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-red-900 via-gray-900 to-black font-inter">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute text-6xl top-20 left-10 animate-float">🌋</div>
        <div className="absolute text-4xl delay-1000 top-40 right-20 animate-float">🔥</div>
        <div className="absolute text-5xl bottom-20 left-1/4 animate-float delay-2000">💎</div>
        <div className="absolute text-3xl bottom-40 right-1/3 animate-float delay-3000">🪨</div>
      </div>

      {/* Back to Dashboard Button */}
      <div className="fixed z-20 top-4 left-4">
        <button
          onClick={() => navigate('/data')}
          className="group relative px-4 py-2 bg-gradient-to-r from-amber-600/80 to-orange-700/80 rounded-lg text-amber-200 font-semibold text-sm shadow-[0_4px_12px_rgba(255,107,0,0.3)] hover:-translate-y-1 transition-all duration-300"
        >
          <span className="relative z-10">← Kembali</span>
          <div className="absolute inset-0 transition-opacity duration-300 rounded-lg opacity-0 bg-amber-500/30 group-hover:opacity-100" />
        </button>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {showNameModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
              <div className="w-full max-w-md p-8 border-2 shadow-2xl bg-gradient-to-br from-slate-900/95 to-stone-900/95 backdrop-blur-sm rounded-3xl border-amber-500/30">
                <h2 className="mb-6 text-3xl font-bold text-center text-amber-200">Masukkan Nama Petualang!</h2>
                <form onSubmit={handleNameSubmit}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nama petualang..."
                    className="w-full p-4 text-center text-white border-2 rounded-xl bg-slate-800/80 border-amber-600/30 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    aria-label="Masukkan nama pengguna"
                  />
                  <button
                    type="submit"
                    className="w-full px-8 py-4 mt-4 font-bold text-white transition-all duration-300 transform shadow-lg bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl hover:from-amber-700 hover:to-yellow-700 hover:scale-105"
                    aria-label="Kirim nama"
                  >
                    Mulai Pencarian Ilmu!
                  </button>
                </form>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="space-y-4 text-3xl text-center text-white">
              <div className="text-6xl animate-spin">⚡</div>
              <div>Mengumpulkan kristal ilmu...</div>
            </div>
          )}

          {error && (
            <div className="space-y-4 text-2xl text-center text-red-400">
              <div className="text-6xl">😱</div>
              <div>{error}</div>
              <button
                onClick={retryFetch}
                className="px-6 py-3 text-white transition-all duration-300 bg-amber-600 rounded-xl hover:bg-amber-700"
                aria-label="Coba lagi"
              >
                🔄 Coba Kumpulkan Lagi
              </button>
            </div>
          )}

          {!isLoading && !error && !showNameModal && (
            <>
              <div className="mb-12 text-center">
                <h1 className="mb-6 text-5xl font-bold md:text-6xl text-amber-200 drop-shadow-2xl">
                  ⛏️ Misi 1 – Batuan Ilmu Retak 🗺️
                </h1>
                <div className="max-w-4xl p-6 mx-auto border bg-gradient-to-r from-amber-900/60 to-yellow-900/60 backdrop-blur-sm rounded-2xl border-amber-500/20">
                  <p className="text-xl leading-relaxed md:text-2xl text-amber-100">
                    <span className="font-bold text-yellow-300">{userName || 'NurM'}</span> harus mengumpulkan kristal data dari pecahan batuan ilmu yang retak akibat letusan purba. 
                    Ayo bantu memutar <span className="font-semibold text-green-400">Roda Batu Bercahaya</span> untuk menyatukan kebijaksanaan! 🔍✨
                  </p>
                </div>
              </div>

              {missionCompleted ? renderCompletionStory() : 
                currentQuestion ? renderQuestionUI() : renderSpinwheel()}
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

export default Mission1;