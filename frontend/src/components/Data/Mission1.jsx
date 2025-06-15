// client/src/components/Data/Mission1.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const Mission1 = ({ missionId, onComplete }) => {
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

  const audioRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const [wheelVisualRotation, setWheelVisualRotation] = useState(0);
  const [spinDurationCss, setSpinDurationCss] = useState('0s');
  const [spinTimingFunction, setSpinTimingFunction] = useState('ease-out');

  const spinwheelOptionsMap = useMemo(() => ({
    'pg': 'Pilihan Ganda',
    'benar-salah': 'Benar/Salah',
    'audio-isian': 'Soal Audio',
    'menjodohkan': 'Menjodohkan Teks',
    'uraian': 'Uraian Singkat',
    'gambar-isian': 'Gambar + Isian'
  }), []);

  const getAvailableSpinOptions = useCallback(() => {
    return Object.keys(questionsByTopic).filter(type => {
      const remainingQuestionsOfType = questionsByTopic[type].filter(q => !answeredQuestions[q.id]);
      return remainingQuestionsOfType.length > 0;
    }).map(type => spinwheelOptionsMap[type]);
  }, [questionsByTopic, answeredQuestions, spinwheelOptionsMap]);

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

    // Jika hanya satu jenis soal tersisa, langsung pilih soal tanpa animasi
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

    // Animasi rolet untuk lebih dari satu opsi
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

  const renderSpinwheel = () => {
    const availableOptions = getAvailableSpinOptions();
    const numSegments = availableOptions.length;

    if (missionCompleted) {
      return (
        <div className="text-center text-white text-2xl font-bold font-comic-sans">
          Selamat! Semua misi telah diselesaikan!
          <div className="mt-4 flex gap-4 justify-center">
            <button
              onClick={resetMission}
              className="px-6 py-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-300"
              aria-label="Main lagi"
            >
              Main Lagi
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="px-6 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300"
              aria-label="Lihat leaderboard"
            >
              Lihat Leaderboard
            </button>
          </div>
        </div>
      );
    }

    if (numSegments === 0 && allQuestions.length > 0) {
      return (
        <div className="text-center text-white text-2xl font-bold font-comic-sans">
          Tidak ada soal tersisa!
        </div>
      );
    }
    if (numSegments === 0 && allQuestions.length === 0) {
      return <div className="text-center text-white text-2xl font-comic-sans">Memuat soal spinwheel...</div>;
    }

    const colors = [
      'fill-blue-500', 'fill-pink-500', 'fill-green-500', 'fill-yellow-500', 'fill-purple-500',
      'fill-cyan-500', 'fill-red-500', 'fill-orange-500', 'fill-teal-500', 'fill-indigo-500',
    ];

    const viewBoxSize = 500;

    return (
      <div className="relative flex flex-col items-center justify-center min-h-[600px] font-comic-sans w-full max-w-[90vw] mx-auto">
        <h3 className="text-4xl font-bold text-white mb-10 drop-shadow-lg">Putar Roda Keberuntungan!</h3>

        <div className="absolute top-[calc(50%-250px)] left-1/2 transform -translate-x-1/2 z-30">
          <svg className="w-16 h-16 text-red-600 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 12h5v10h10v-10h5L12 2z"/>
          </svg>
        </div>

        <div className="relative w-full aspect-square max-w-[500px]">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ 
              transform: `rotate(${wheelVisualRotation}deg)`,
              transition: `transform ${spinDurationCss} ${spinTimingFunction}`
            }}
            aria-label="Roda keberuntungan"
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
                    className={`${colors[index % colors.length]} hover:brightness-110 transition-all duration-200`}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    fill="white"
                    fontSize={numSegments > 6 ? "16" : "20"}
                    fontWeight="bold"
                    transform={`rotate(${startAngle + (360 / numSegments) / 2}, ${textX}, ${textY})`}
                    className="drop-shadow-lg"
                  >
                    {option}
                  </text>
                </g>
              );
            })}
            <circle cx={viewBoxSize / 2} cy={viewBoxSize / 2} r="30" fill="white" stroke="gray" strokeWidth="2" />
          </svg>

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200 z-20">
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="w-full h-full flex items-center justify-center text-gray-800 disabled:opacity-50"
              aria-label="Putar roda"
              aria-disabled={spinning}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643L18.75 12l-11.47 7.99C6.029 20.65 4.5 19.74 4.5 18.347V5.653Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {spinResultTopic && !spinning && (
          <div className="mt-10 text-2xl font-bold text-yellow-300 animate-pulse">
            Terpilih: {spinResultTopic}! <button onClick={() => setSpinResultTopic(null)} className="ml-2 text-white underline">Lanjutkan</button>
          </div>
        )}
      </div>
    );
  };

  const renderQuestionUI = () => {
    if (!currentQuestion) return null;

    return (
      <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-white/10 w-full max-w-2xl mx-auto shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">{spinwheelOptionsMap[currentQuestion.type]}</h3>
        <p className="text-xl font-semibold text-white mb-4 text-center whitespace-pre-line">
          {currentQuestion.question_text}
        </p>

        {currentQuestion.type === 'audio-isian' && currentQuestion.audio_url ? (
          <div className="text-center mb-4">
            {audioError ? (
              <div className="text-red-400 mb-4">{audioError}</div>
            ) : (
              <audio
                ref={audioRef}
                src={currentQuestion.audio_url}
                controls
                className="mb-4 mx-auto w-full max-w-sm"
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
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
              aria-label="Putar ulang audio"
              disabled={audioError}
            >
              Putar Ulang Audio
            </button>
          </div>
        ) : currentQuestion.type === 'audio-isian' ? (
          <div className="text-center mb-4 text-red-400">
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
                      className={`p-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600
                        ${showFeedback ? (option === currentQuestion.correct_answer ? 'bg-green-700' : 'bg-red-700') : ''}
                        disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
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
                      className={`p-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600
                        ${showFeedback ? (option === currentQuestion.correct_answer ? 'bg-green-700' : 'bg-red-700') : ''}
                        disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
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
                    placeholder="Tuliskan jawabanmu..."
                    className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={showFeedback}
                    aria-label="Masukkan jawaban audio"
                  />
                  <button
                    onClick={() => handleSubmitAnswer(userAnswer)}
                    disabled={!userAnswer.trim() || showFeedback}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    aria-label="Kirim jawaban"
                  >
                    Submit
                  </button>
                </div>
              );
            case 'menjodohkan':
              return (
                <div className="text-center">
                
                  <div className="flex flex-col gap-4 max-w-lg mx-auto">
                    {currentQuestion.options.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-3 bg-gray-700 rounded-lg text-white">
                        <span className="mb-2 sm:mb-0 text-left flex-1 whitespace-pre-line">{item}</span>
                        <select
                          value={userMatchingAnswers[item] || ''}
                          onChange={(e) => handleMatchingChange(item, e.target.value)}
                          className="p-2 rounded-lg bg-gray-600 text-white border border-gray-500 w-full sm:w-auto"
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
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    aria-label="Kirim jawaban menjodohkan"
                  >
                    Submit
                  </button>
                </div>
              );
            case 'uraian':
              return (
                <div className="text-center">
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Tulis jawabanmu di sini (pisahkan dengan koma jika ada beberapa jawaban kunci)..."
                    rows="4"
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={showFeedback}
                    aria-label="Masukkan jawaban uraian"
                  />
                  <button
                    onClick={() => handleSubmitAnswer(userAnswer)}
                    disabled={!userAnswer.trim() || showFeedback}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    aria-label="Kirim jawaban"
                  >
                    Submit
                  </button>
                </div>
              );
            case 'gambar-isian':
              return (
                <div className="text-center">
                  {currentQuestion.image_url && (
                    <img src={currentQuestion.image_url} alt="Ilustrasi Pertanyaan" className="mb-4 max-w-xs mx-auto rounded-lg shadow-lg" />
                  )}
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Masukkan jawaban singkat..."
                    className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={showFeedback}
                    aria-label="Masukkan jawaban gambar"
                  />
                  <button
                    onClick={() => handleSubmitAnswer(userAnswer)}
                    disabled={!userAnswer.trim() || showFeedback}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    aria-label="Kirim jawaban"
                  >
                    Submit
                  </button>
                </div>
              );
            default:
              return <p className="text-red-400">Tipe pertanyaan tidak dikenal.</p>;
          }
        })()}

        {showFeedback && (
          <div className={`mt-6 text-lg text-center font-bold ${result ? 'text-green-400' : 'text-red-400'} animate-fade-in`}>
            {result ? `Benar! Kamu mendapatkan ${currentQuestion.score} XP!` : 'Salah, coba lagi!'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-900 p-6 flex items-center justify-center font-comic-sans">
      <div className="relative z-10 w-full">
        {showNameModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Masukkan Nama Petualangmu!</h2>
              <form onSubmit={handleNameSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Nama kamu..."
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                  aria-label="Masukkan nama pengguna"
                />
                <button
                  type="submit"
                  className="w-full px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
                  aria-label="Kirim nama"
                >
                  Mulai Petualangan!
                </button>
              </form>
            </div>
          </div>
        )}
        {isLoading && <div className="text-white text-center text-2xl">Memuat soal...</div>}
        {error && (
          <div className="text-center text-red-400 text-2xl">
            {error}
            <button
              onClick={retryFetch}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              aria-label="Coba lagi"
            >
              Coba Lagi
            </button>
          </div>
        )}
        {!isLoading && !error && !showNameModal && (currentQuestion ? renderQuestionUI() : renderSpinwheel())}
      </div>
    </div>
  );
};

export default Mission1;
