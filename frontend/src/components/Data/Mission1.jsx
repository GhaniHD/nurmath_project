import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Mission1 = ({ missionId, onComplete, userName }) => {
  const [allQuestions, setAllQuestions] = useState([]);
  const [questionsByTopic, setQuestionsByTopic] = useState({});
  const [currentQuestionType, setCurrentQuestionType] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState({});

  const [spinning, setSpinning] = useState(false);
  const [spinResultTopic, setSpinResultTopic] = useState(null);
  const [result, setResult] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [userMatchingAnswers, setUserMatchingAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  // State untuk rotasi roda agar terlihat berputar dan berhenti di posisi yang diinginkan
  const [wheelVisualRotation, setWheelVisualRotation] = useState(0);

  // State baru untuk kontrol transisi CSS
  const [spinDurationCss, setSpinDurationCss] = useState('0s'); // Durasi transisi awal
  const [spinTimingFunction, setSpinTimingFunction] = useState('ease-out'); // Fungsi easing awal

  // Define the types that can appear on the spinwheel
  const spinwheelOptionsMap = {
    'pg': 'Pilihan Ganda',
    'benar-salah': 'Benar/Salah',
    'audio-menjodohkan': 'Audio Menjodohkan',
    'menjodohkan': 'Menjodohkan Teks',
    'uraian': 'Uraian Singkat',
    'gambar-isian': 'Gambar + Isian'
  };

  const getAvailableSpinOptions = useCallback(() => {
    return Object.keys(questionsByTopic).filter(type => {
      const remainingQuestionsOfType = questionsByTopic[type].filter(q => !answeredQuestions[q._id]);
      return remainingQuestionsOfType.length > 0;
    }).map(type => spinwheelOptionsMap[type]); // Return display names for the wheel
  }, [questionsByTopic, answeredQuestions, spinwheelOptionsMap]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/questions/${missionId}`);
        const data = await response.json();
        if (response.ok) {
          setAllQuestions(data);
          const organized = {};
          data.forEach(q => {
            if (!organized[q.type]) {
              organized[q.type] = [];
            }
            organized[q.type].push(q);
          });
          setQuestionsByTopic(organized);
        } else {
          console.error('Fetch error:', data.error);
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
      }
    };
    fetchQuestions();
  }, [missionId]);

  useEffect(() => {
    if (allQuestions.length > 0) {
      const totalQuestionsCount = allQuestions.length;
      const answeredCount = Object.keys(answeredQuestions).length;

      if (answeredCount > 0 && answeredCount === totalQuestionsCount) {
        alert('Misi selesai! Semua pertanyaan telah dijawab!');
        navigate('/leaderboard');
      }
    }
  }, [answeredQuestions, allQuestions.length, navigate]);

  const resetQuestionState = useCallback(() => {
    setResult(null);
    setUserAnswer('');
    setUserMatchingAnswers({});
    setShowFeedback(false);
    setCurrentQuestion(null);
    setCurrentQuestionType(null);
    setSpinResultTopic(null);
    // Reset transisi kembali ke default atau nol
    setSpinDurationCss('0s');
    setSpinTimingFunction('ease-out');
  }, []);

  const handleSpin = () => {
    const availableOptions = getAvailableSpinOptions();
    if (availableOptions.length === 0) {
      alert('Tidak ada jenis soal yang tersedia lagi!');
      return;
    }

    setSpinning(true);
    setSpinResultTopic(null); // Clear previous result text immediately

    // Atur durasi total perputaran untuk mencapai efek cepat ke sedang
    const fastSpinDuration = 1000; // Durasi fase cepat (misal 1 detik)
    const slowDownDuration = 2000; // Durasi fase melambat (misal 2 detik)
    const totalSpinDuration = fastSpinDuration + slowDownDuration;

    // Tentukan segmen target
    const randomIndex = Math.floor(Math.random() * availableOptions.length);
    const selectedTopicText = availableOptions[randomIndex];
    const numSegments = availableOptions.length;
    const segmentAngle = 360 / numSegments;

    // Hitung rotasi target untuk roda
    const selectedSegmentCenterAngle = (randomIndex * segmentAngle) + (segmentAngle / 2);
    // Pastikan roda berhenti dengan segmen target di atas (di bawah pointer)
    let finalAngle = 360 - selectedSegmentCenterAngle;
    finalAngle += (360 * 5); // Tambahkan 5 putaran penuh untuk efek visual

    // Fase 1: Perputaran cepat
    setSpinTimingFunction('linear'); // Kecepatan konstan
    setSpinDurationCss(`${fastSpinDuration}ms`);
    // Tambahkan putaran lebih banyak untuk fase cepat
    setWheelVisualRotation(prev => prev + (360 * 3)); // Tambahkan 3 putaran penuh lagi secara instan untuk mempercepat kesan

    setTimeout(() => {
      // Fase 2: Melambat ke hasil akhir
      setSpinTimingFunction('cubic-bezier(0.25, 0.1, 0.25, 1.0)'); // Easing yang melambat
      setSpinDurationCss(`${slowDownDuration}ms`);
      setWheelVisualRotation(finalAngle); // Atur ke sudut akhir

      setTimeout(() => {
        setSpinResultTopic(selectedTopicText); // Tampilkan hasil setelah durasi spin selesai
        // Temukan tipe pertanyaan dari teks
        const selectedTypeKey = Object.keys(spinwheelOptionsMap).find(key => spinwheelOptionsMap[key] === selectedTopicText);
        setCurrentQuestionType(selectedTypeKey);

        // Dapatkan pertanyaan yang belum dijawab dari tipe ini
        const questionsOfType = questionsByTopic[selectedTypeKey] || [];
        const unansweredQuestionsOfType = questionsOfType.filter(q => !answeredQuestions[q._id]);

        if (unansweredQuestionsOfType.length > 0) {
          const randomQuestionIndex = Math.floor(Math.random() * unansweredQuestionsOfType.length);
          setCurrentQuestion(unansweredQuestionsOfType[randomQuestionIndex]);
        } else {
          console.warn(`No unanswered questions for type: ${selectedTypeKey}. Resetting spinwheel.`);
          resetQuestionState();
        }
        setSpinning(false);
      }, slowDownDuration); // Tunggu fase melambat selesai
    }, fastSpinDuration); // Tunggu fase cepat selesai sebelum memulai fase melambat
  };

  const handleSubmitAnswer = async (answer) => {
    if (!currentQuestion) return;

    let isCorrect = false;
    switch (currentQuestion.type) {
      case 'pg':
      case 'benar-salah':
      case 'audio-menjodohkan':
        isCorrect = answer === currentQuestion.correctAnswer;
        break;
      case 'uraian':
        const correctKeywordsUraian = currentQuestion.correctAnswer.toLowerCase().split(',').map(k => k.trim());
        const userKeywordsUraian = answer.toLowerCase().split(/[\s,.;]+/).map(k => k.trim()).filter(k => k);
        isCorrect = correctKeywordsUraian.every(keyword => userKeywordsUraian.includes(keyword));
        break;
      case 'gambar-isian':
        isCorrect = answer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
        break;
      case 'menjodohkan':
        isCorrect = JSON.stringify(answer) === JSON.stringify(currentQuestion.correctAnswer);
        break;
      default:
        isCorrect = false;
    }

    setResult(isCorrect);
    setShowFeedback(true);
    const score = isCorrect ? currentQuestion.score : 0;

    if (onComplete) {
      onComplete(score, missionId);
    }

    if (isCorrect && userName) {
      try {
        await fetch('http://localhost:3001/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userName, score, missionId }),
        });
      } catch (err) {
        console.error('Error submitting to leaderboard:', err);
      }
    }

    setAnsweredQuestions(prev => ({ ...prev, [currentQuestion._id]: true }));

    setTimeout(() => {
      resetQuestionState();
    }, 1500);
  };

  const handleMatchingChange = (item, target) => {
    setUserMatchingAnswers(prev => ({ ...prev, [item]: target }));
  };

  // --- Render Functions ---

  const renderSpinwheel = () => {
    const availableOptions = getAvailableSpinOptions();
    const numSegments = availableOptions.length;

    // If no segments available, means all questions answered or none loaded
    if (numSegments === 0 && allQuestions.length > 0) {
      return (
        <div className="text-center text-white text-2xl font-bold">
          Semua misi telah diselesaikan!
          <button
            onClick={() => navigate('/leaderboard')}
            className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300"
          >
            Lihat Leaderboard
          </button>
        </div>
      );
    }
    if (numSegments === 0 && allQuestions.length === 0) {
      return <div className="text-center text-white text-2xl font-comic-sans">Memuat soal spinwheel...</div>;
    }

    const colors = [
      'fill-blue-500',
      'fill-pink-500',
      'fill-green-500',
      'fill-yellow-500',
      'fill-purple-500',
      'fill-cyan-500',
      'fill-red-500',
      'fill-orange-500',
      'fill-teal-500',
      'fill-indigo-500',
    ];

    const radius = 140; // SVG radius
    const center = 150; // Center of the SVG (half of 300x300 viewBox)

    return (
      <div className="relative flex flex-col items-center justify-center min-h-[500px] font-comic-sans">
        <h3 className="text-3xl font-bold text-white mb-8 drop-shadow-lg">Putar Roda Keberuntungan!</h3>

        {/* Pointer */}
        <div className="absolute top-[calc(50%-170px)] left-1/2 transform -translate-x-1/2 z-30">
          <svg className="w-12 h-12 text-red-600 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 12h5v10h10v-10h5L12 2z"/>
          </svg>
        </div>

        {/* Wheel SVG */}
        <div className="relative w-[300px] h-[300px]">
          <svg
            width="300"
            height="300"
            viewBox="0 0 300 300"
            // Menggunakan gaya inline untuk transisi agar bisa dikontrol secara dinamis
            style={{ 
              transform: `rotate(${wheelVisualRotation}deg)`,
              transition: `transform ${spinDurationCss} ${spinTimingFunction}`
            }}
          >
            {availableOptions.map((option, index) => {
              const startAngle = index * (360 / numSegments);
              const endAngle = startAngle + (360 / numSegments);
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              const x1 = center + radius * Math.cos(startRad);
              const y1 = center + radius * Math.sin(startRad);
              const x2 = center + radius * Math.cos(endRad);
              const y2 = center + radius * Math.sin(endRad);
              const largeArcFlag = (360 / numSegments) > 180 ? 1 : 0;

              // Text position (midpoint of arc, slightly inward)
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
                    strokeWidth="1.5"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    fill="white"
                    fontSize={numSegments > 6 ? "10" : "12"}
                    fontWeight="bold"
                    transform={`rotate(${startAngle + (360 / numSegments) / 2}, ${textX}, ${textY})`}
                    className="drop-shadow-sm"
                  >
                    {option}
                  </text>
                </g>
              );
            })}
            {/* Decorative center circle */}
            <circle cx="150" cy="150" r="20" fill="white" stroke="gray" strokeWidth="2" />
          </svg>

          {/* Center Button */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200 z-20">
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="w-full h-full flex items-center justify-center text-gray-800 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643L18.75 12l-11.47 7.99C6.029 20.65 4.5 19.74 4.5 18.347V5.653Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {spinResultTopic && !spinning && (
          <p className="mt-8 text-xl font-bold text-yellow-300 animate-pulse">
            Terpilih: {spinResultTopic}!
          </p>
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
          {currentQuestion.questionText}
        </p>

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
                        ${showFeedback ? (option === currentQuestion.correctAnswer ? 'bg-green-700' : 'bg-red-700') : ''}
                        disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                      `}
                      disabled={showFeedback}
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
                        ${showFeedback ? (option === currentQuestion.correctAnswer ? 'bg-green-700' : 'bg-red-700') : ''}
                        disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                      `}
                      disabled={showFeedback}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              );
            case 'audio-menjodohkan':
              return (
                <div className="text-center">
                  {currentQuestion.audioUrl && <audio ref={audioRef} src={currentQuestion.audioUrl} controls className="mb-4 mx-auto" />}
                  <select
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600 w-full max-w-xs"
                    disabled={showFeedback}
                  >
                    <option value="">Pilih pasangan</option>
                    {currentQuestion.options.map((option, idx) => (
                      <option key={idx} value={option}>{option}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleSubmitAnswer(userAnswer)}
                    disabled={!userAnswer || showFeedback}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Submit
                  </button>
                </div>
              );
            case 'menjodohkan':
              return (
                <div className="text-center">
                  <p className="text-white mb-4">Cocokkan pernyataan dengan klasifikasi data yang tepat:</p>
                  <div className="flex flex-col gap-4 max-w-lg mx-auto">
                    {currentQuestion.options.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-3 bg-gray-700 rounded-lg text-white">
                        <span className="mb-2 sm:mb-0 text-left flex-1">{item}</span>
                        <select
                          value={userMatchingAnswers[item] || ''}
                          onChange={(e) => handleMatchingChange(item, e.target.value)}
                          className="p-2 rounded-lg bg-gray-600 text-white border border-gray-500 w-full sm:w-auto"
                          disabled={showFeedback}
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
                  />
                  <button
                    onClick={() => handleSubmitAnswer(userAnswer)}
                    disabled={!userAnswer.trim() || showFeedback}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Submit
                  </button>
                </div>
              );
            case 'gambar-isian':
              return (
                <div className="text-center">
                  {currentQuestion.imageUrl && (
                    <img src={currentQuestion.imageUrl} alt="Ilustrasi Pertanyaan" className="mb-4 max-w-xs mx-auto rounded-lg shadow-lg" />
                  )}
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Masukkan jawaban singkat..."
                    className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={showFeedback}
                  />
                  <button
                    onClick={() => handleSubmitAnswer(userAnswer)}
                    disabled={!userAnswer.trim() || showFeedback}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
        {currentQuestion ? renderQuestionUI() : renderSpinwheel()}
      </div>
    </div>
  );
};

export default Mission1;