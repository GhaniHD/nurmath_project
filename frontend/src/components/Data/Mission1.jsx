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
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
            userKeywords.some(user => levenshteinDistance(user, correct) <= 2
            )
          )
          {
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
  const renderSpinwheel = () => {
    const availableOptions = getAvailableSpinOptions();
    const numSegments = availableOptions.length;

    if (missionCompleted) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-amber-200 text-3xl font-bold font-cinzel">
            Selamat! Semua Batu Ilmu Retak Terkumpul!
            <div className="mt-6 flex gap-6 justify-center">
              <button
                onClick={resetMission}
                className="px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-700 text-amber-200 rounded-xl shadow-lg hover:from-gray-700 hover:to-gray-600 hover:ring-2 hover:ring-amber-500 transition-all duration-300 font-cinzel"
                aria-label="Main lagi"
              >
                Kumpulkan Lagi
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-700 text-amber-200 rounded-xl shadow-lg hover:from-gray-700 hover:to-gray-600 hover:ring-2 hover:ring-amber-500 transition-all duration-300 font-cinzel"
                aria-label="Lihat leaderboard"
              >
                Lihat Peringkat Petualang
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (numSegments === 0 && allQuestions.length > 0) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-amber-200 text-3xl font-bold font-cinzel">
            Tidak ada Batu Ilmu Retak tersisa!
          </div>
        </div>
      );
    }
    if (numSegments === 0 && allQuestions.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-amber-200 text-3xl font-cinzel">Memuat Roda Batuan...</div>
        </div>
      );
    }

    const colors = [
      'fill-stone-700', 'fill-red-800', 'fill-orange-700', 'fill-amber-700', 'fill-yellow-600',
      'fill-stone-600', 'fill-red-700', 'fill-orange-600', 'fill-amber-600', 'fill-yellow-700',
    ];

    const viewBoxSize = 500;

    return (
      <div className="h-lg flex items-center justify-center px-4 w-lg ml-24">
        <div className="bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-2xl p-10 border-4 border-amber-600/30 shadow-[0_0_25px_rgba(255,167,38,0.4)] ">
          {/* Main Title */}
          <div className="text-center mb-12">
            <h2 className="text-6xl font-bold text-amber-200 mb-4 drop-shadow-[0_4px_8px_rgba(255,167,38,0.6)] tracking-tight font-cinzel">
              Putar Roda Batu Ilmu!
            </h2>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto font-cinzel leading-relaxed">
              Pilih Batu Ilmu Retak yang ingin kamu kumpulkan dengan memutar roda. Setiap putaran akan memilih satu jenis soal untuk dijawab.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-center">
            {/* Spinwheel Section */}
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
                  aria-label="Roda Batu Ilmu Retak"
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

                    const textAngle = (startAngle + (360 / numSegments) / 2) * (Math.PI / 180);
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

                {/* Spin Button */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-amber-600 to-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,167,38,0.6)] hover:scale-110 transition-transform duration-300 z-20">
                  <button
                    onClick={handleSpin}
                    disabled={spinning}
                    className="w-full h-full flex items-center justify-center text-black disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-amber-500"
                    aria-label="Putar roda"
                    aria-disabled={spinning}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643L18.75 12l-11.47 7.99C6.029 20.65 4.5 19.74 4.5 18.347V5.653Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Spin Result */}
              {spinResultTopic && !spinning && (
                <div className="mt-8 text-center">
                  <div className="text-3xl font-bold text-amber-200 animate-pulse drop-shadow-[0_2px_4px_rgba(255,167,38,0.6)] font-cinzel">
                    Batu Ilmu Terpilih: {spinResultTopic}!
                  </div>
                  <button 
                    onClick={() => setSpinResultTopic(null)} 
                    className="mt-4 px-6 py-2 text-amber-100 underline hover:text-amber-300 transition-colors duration-200 font-cinzel text-lg"
                  >
                    Lanjutkan ke Soal
                  </button>
                </div>
              )}
            </div>

            {/* Story Section */}
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-2xl p-10 border-4 border-amber-600/30 shadow-[0_0_25px_rgba(255,167,38,0.4)] text-amber-100 font-cinzel max-w-lg">
                <h3 className="text-4xl font-bold text-amber-200 mb-8 text-center tracking-wide">
                  Roda Batu Ilmu Retak
                </h3>
                <div className="space-y-6 text-lg leading-relaxed">
                  <p className="text-center">
                    Di puncak Gunung Pengetahuan, NurM menghadapi Roda Batu Kuno yang bersinar dalam kabut vulkanik.
                  </p>
                  <p className="text-center">
                    Setiap segmen roda menyimpan pecahan Batuan Ilmu Retak, pengetahuan yang tercerai-berai akibat letusan purba.
                  </p>
                  <p className="text-center">
                    Dengan satu putaran, roda memilih teka-teki untuk dipecahkan NurM demi memulihkan kebijaksanaan.
                  </p>
                  <p className="text-center mt-8 font-bold text-amber-200 text-xl">
                    Putar roda dan selamatkan dunia NurMath!
                  </p>
                </div>
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
      <div className="min-h-screen flex items-center justify-center py-8 px-4 w-lg ml-24">
        <div className="bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-2xl p-10 border-4 border-amber-600/30 w-full max-w-4xl mx-auto shadow-[0_0_25px_rgba(255,167,38,0.4)]">
          <h3 className="text-4xl font-bold text-amber-200 mb-8 text-center font-cinzel tracking-wide">
            {spinwheelOptionsMap[currentQuestion.type]}
          </h3>
          <p className="text-xl font-semibold text-amber-100 mb-8 text-center whitespace-pre-line font-cinzel leading-relaxed">
            {currentQuestion.question_text}
          </p>

          {currentQuestion.type === 'audio-isian' && currentQuestion.audio_url ? (
            <div className="text-center mb-6">
              {audioError ? (
                <div className="text-red-300 mb-4">{audioError}</div>
              ) : (
                <audio
                  ref={audioRef}
                  src={currentQuestion.audio_url}
                  controls
                  className="mb-4 mx-auto w-full max-w-md"
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
                className="px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-700 text-amber-200 rounded-xl shadow-md hover:from-gray-700 hover:to-gray-600 hover:ring-2 hover:ring-amber-500 transition-all duration-300 font-cinzel"
                aria-label="Putar ulang audio"
                disabled={audioError}
              >
                Putar Ulang Audio
              </button>
            </div>
          ) : currentQuestion.type === 'audio-isian' ? (
            <div className="text-center mb-6 text-red-300">
              Audio tidak tersedia untuk soal ini.
            </div>
          ) : null}

          {(() => {
            switch (currentQuestion.type) {
              case 'pg':
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSubmitAnswer(option)}
                        className={`p-4 bg-gradient-to-r from-gray-800 to-gray-700 text-amber-200 rounded-xl shadow-md hover:from-gray-700 hover:to-gray-600 hover:ring-2 hover:ring-amber-500
                          ${showFeedback ? (option === currentQuestion.correct_answer ? 'bg-green-700' : 'bg-red-700') : ''}
                          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-cinzel
                        `}
                        disabled={showFeedback}
                        aria-label={`Pilih jawaban ${option}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                );
              case 'benar-salah':
                return (
                  <div className="grid grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSubmitAnswer(option)}
                        className={`p-4 bg-gradient-to-r from-gray-800 to-gray-700 text-amber-200 rounded-xl shadow-md hover:from-gray-700 hover:to-gray-600 hover:ring-2 hover:ring-amber-500
                          ${showFeedback ? (option === currentQuestion.correct_answer ? 'bg-green-700' : 'bg-red-700') : ''}
                          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-cinzel
                        `}
                        disabled={showFeedback}
                        aria-label={`Pilih jawaban ${option}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                );
              case 'audio-isian':
                return (
                  <div className="text-center">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Tuliskan Batu Ilmu..."
                      className="p-3 rounded-xl bg-gray-800 text-amber-200 border border-amber-600/30 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-cinzel"
                      disabled={showFeedback}
                      aria-label="Masukkan jawaban audio"
                    />
                    <button
                      onClick={() => handleSubmitAnswer(userAnswer)}
                      disabled={!userAnswer.trim() || showFeedback}
                      className="mt-4 px-8 py-2 bg-gradient-to-r from-gray-800 to-gray-700 text-amber-200 rounded-xl shadow-md hover:from-gray-700 hover:to-gray-600 hover:ring-2 hover:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-cinzel"
                      aria-label="Kirim jawaban"
                    >
                      Kirim
                    </button>
                  </div>
                );
              case 'menjodohkan':
                return (
                  <div className="text-center">
                    <div className="flex flex-col gap-4 max-w-xl mx-auto">
                      {currentQuestion.options.map((item, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl text-amber-200">
                          <span className="mb-2 sm:mb-0 text-left flex-1 whitespace-pre-line font-cinzel">{item}</span>
                          <select
                            value={userMatchingAnswers[item] || ''}
                            onChange={(e) => handleMatchingChange(item, e.target.value)}
                            className="p-3 rounded-xl bg-gray-800 text-amber-200 border border-amber-600/30 w-full sm:w-auto font-cinzel focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    <button
                      onClick={() => handleSubmitAnswer(userMatchingAnswers)}
                      disabled={Object.keys(userMatchingAnswers).length !== currentQuestion.options.length || showFeedback}
                      className="mt-4 px-8 py-2 bg-gradient-to-r from-gray-800 to-gray-700 text-amber-200 rounded-xl shadow-md hover:from-gray-700 hover:to-gray-600 hover:ring-2 hover:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-cinzel"
                      aria-label="Kirim jawaban menjodohkan"
                    >
                      Kirim
                    </button>
                  </div>
                );
              case 'uraian':
                return (
                  <div className="text-center">
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Tulis Batu Ilmu di sini (pisahkan dengan koma jika ada beberapa jawaban kunci)..."
                      rows="4"
                      className="w-full p-4 rounded-xl bg-gray-800 text-amber-200 border border-amber-600/30 focus:outline-none focus:ring-2 focus:ring-amber-500 font-cinzel"
                      disabled={showFeedback}
                      aria-label="Masukkan jawaban uraian"
                    />
                    <button
                      onClick={() => handleSubmitAnswer(userAnswer)}
                      disabled={!userAnswer.trim() || showFeedback}
                      className="mt-4 px-8 py-2 bg-gradient-to-r from-gray-800 to-gray-700 text-amber-200 rounded-xl shadow-md hover:from-gray-700 hover:to-gray-600 hover:ring-2 hover:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-cinzel"
                      aria-label="Kirim jawaban"
                    >
                      Kirim
                    </button>
                  </div>
                );
              case 'gambar-isian':
                return (
                  <div className="text-center">
                    {currentQuestion.image_url && (
                      <img src={currentQuestion.image_url} alt="Ilustrasi Batuan" className="mb-6 max-w-sm mx-auto rounded-xl shadow-[0_0_15px_rgba(255,167,38,0.4)]" />
                    )}
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Masukkan Batu Ilmu singkat..."
                      className="p-3 rounded-xl bg-gray-800 text-amber-200 border border-amber-600/30 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-cinzel"
                      disabled={showFeedback}
                      aria-label="Masukkan jawaban gambar"
                    />
                    <button
                      onClick={() => handleSubmitAnswer(userAnswer)}
                      disabled={!userAnswer.trim() || showFeedback}
                      className="mt-4 px-8 py-2 bg-gradient-to-r from-gray-800 to-gray-700 text-amber-200 rounded-xl shadow-md hover:from-gray-700 hover:to-gray-600 hover:ring-2 hover:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-cinzel"
                      aria-label="Kirim jawaban"
                    >
                      Kirim
                    </button>
                  </div>
                );
              default:
                return <p className="text-red-300 font-cinzel">Tipe Batu Ilmu tidak dikenal.</p>;
            }
          })()}

          {showFeedback && (
            <div className={`mt-8 text-xl text-center font-bold ${result ? 'text-green-400' : 'text-red-300'} animate-pulse font-cinzel`}>
              {result ? `Benar! Kamu mengumpulkan ${currentQuestion.score} Batu Ilmu Retak!` : 'Salah, coba lagi!'}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8 flex items-center justify-end font-cinzel relative overflow-hidden">
      <style>
        {`
          @keyframes drift {
            0% { transform: translate(0, 0); opacity: 0.4; }
            50% { opacity: 0.2; }
            100% { transform: translate(30px, -100vh); opacity: 0; }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 15px rgba(255, 167, 38, 0.5); }
            50% { box-shadow: 0 0 25px rgba(255, 167, 38, 0.8); }
          }
          .ash-particle {
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            animation: drift 12s infinite linear;
          }
          .crack-line::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 3px;
            background: linear-gradient(to right, transparent, rgba(255, 167, 38, 0.7), transparent);
            animation: glow 2.5s infinite;
          }
          .glowing-orb {
            position: absolute;
            background: radial-gradient(circle, rgba(255, 167, 38, 0.7), transparent);
            border-radius: 50%;
            animation: glow 4s infinite ease-in-out;
          }
        `}
      </style>
      <div className="relative z-10 w-full max-w-5xl">
        {showNameModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gradient-to-b from-gray-900/95 to-gray-800/95 rounded-2xl p-10 max-w-md w-full border-4 border-amber-600/30 shadow-[0_0_25px_rgba(255,167,38,0.4)]">
              <h2 className="text-3xl font-bold text-amber-200 mb-6 text-center font-cinzel tracking-wide">Masukkan Nama Petualang NurM!</h2>
              <form onSubmit={handleNameSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Nama petualang..."
                  className="w-full p-4 rounded-xl bg-gray-800 text-amber-200 border border-amber-600/30 focus:outline-none focus:ring-2 focus:ring-amber-500 font-cinzel"
                  aria-label="Masukkan nama pengguna"
                />
                <button
                  type="submit"
                  className="w-full mt-4 px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-700 text-amber-200 rounded-xl shadow-md hover:from-gray-700 hover:to-gray-600 hover:ring-2 hover:ring-amber-500 transition-all duration-300 font-cinzel"
                  aria-label="Kirim nama"
                >
                  Mulai Pencarian Ilmu!
                </button>
              </form>
            </div>
          </div>
        )}
        {isLoading && <div className="text-amber-200 text-center text-3xl font-cinzel">Memuat Batu Ilmu Retak...</div>}
        {error && (
          <div className="text-center text-red-300 text-3xl font-cinzel">
            {error}
            <button
              onClick={retryFetch}
              className="ml-4 px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-700 text-amber-200 rounded-xl hover:from-gray-700 hover:to-gray-600 hover:ring-2 hover:ring-amber-500 font-cinzel"
              aria-label="Coba lagi"
            >
              Coba Lagi
            </button>
          </div>
        )}
        {!isLoading && !error && !showNameModal && (
          <div className="flex items-center justify-center px-4">
            <div className="w-full max-w-4xl">
              {currentQuestion ? renderQuestionUI() : renderSpinwheel()}
            </div>
          </div>
        )}
      </div>
      {/* Decorative Elements */}
      <div className="ash-particle w-2 h-2 top-10 left-20"></div>
      <div className="ash-particle w-3 h-3 top-40 right-30 delay-1000"></div>
      <div className="ash-particle w-1 h-1 bottom-20 left-50 delay-2000"></div>
      <div className="ash-particle w-2 h-2 top-60 right-10 delay-3000"></div>
      <div className="crack-line w-1/3 top-1/4 left-0 transform rotate-45"></div>
      <div className="crack-line w-1/4 bottom-1/3 right-0 transform -rotate-30"></div>
      <div className="glowing-orb w-8 h-8 top-10 right-20"></div>
      <div className="glowing-orb w-12 h-12 bottom-10 left-10 delay-1500"></div>
    </div>
  );
};

export default Mission1;