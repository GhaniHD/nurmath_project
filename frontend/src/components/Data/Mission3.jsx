// client/src/components/Data/Mission3.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Mission3 = ({ missionId, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userName] = useState(() => localStorage.getItem('userName') || '');

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/questions/${missionId}`);
        const data = await response.json();
        if (response.ok) {
          setQuestions(data);
        } else {
          setError(data.error || 'Gagal memuat soal');
        }
      } catch (err) {
        setError('Koneksi gagal. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [missionId, API_URL]);

  const handleSubmitAnswer = () => {
    if (!questions[currentQuestionIndex] || !userAnswer.trim()) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.correct_answer.toLowerCase();
    setResult(isCorrect);
    setShowFeedback(true);
    const score = isCorrect ? currentQuestion.score : 0;

    if (onComplete) {
      onComplete(score, missionId);
    }

    setTimeout(() => {
      setUserAnswer('');
      setResult(null);
      setShowFeedback(false);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        alert('Misi selesai! Semua soal telah dijawab!');
        navigate('/leaderboard');
      }
    }, 1500);
  };

  const renderQuiz = () => {
    if (!questions.length) return null;
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-white/10 w-full max-w-2xl mx-auto shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Kuis Atmosfer #{currentQuestionIndex + 1}</h3>
        <p className="text-xl font-semibold text-white mb-4 text-center">{currentQuestion.question_text}</p>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Tulis jawabanmu..."
          className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={showFeedback}
          aria-label="Masukkan jawaban"
        />
        <button
          onClick={handleSubmitAnswer}
          disabled={!userAnswer.trim() || showFeedback}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 transition-all duration-300"
          aria-label="Kirim jawaban"
        >
          Submit
        </button>
        {showFeedback && (
          <div className={`mt-6 text-lg text-center font-bold ${result ? 'text-green-400' : 'text-red-400'}`}>
            {result ? `Benar! Kamu mendapatkan ${currentQuestion.score} XP!` : 'Salah, coba lagi!'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-6 font-comic-sans">
      <div className="relative z-10 max-w-4xl mx-auto">
        {isLoading && <div className="text-white text-center text-2xl">Memuat soal...</div>}
        {error && (
          <div className="text-center text-red-400 text-2xl">
            {error}
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                // Retry fetch
                const fetchQuestions = async () => {
                  try {
                    const response = await fetch(`${API_URL}/api/questions/${missionId}`);
                    const data = await response.json();
                    if (response.ok) {
                      setQuestions(data);
                    } else {
                      setError(data.error || 'Gagal memuat soal');
                    }
                  } catch (err) {
                    setError('Koneksi gagal. Silakan coba lagi.');
                  } finally {
                    setIsLoading(false);
                  }
                };
                fetchQuestions();
              }}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              aria-label="Coba lagi"
            >
              Coba Lagi
            </button>
          </div>
        )}
        {!isLoading && !error && !userName && (
          <div className="text-center text-white text-2xl">
            Silakan masukkan nama petualang di Misi 1!
            <button
              onClick={() => navigate('/data/misi-1')}
              className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              aria-label="Ke Misi 1"
            >
              Ke Misi 1
            </button>
          </div>
        )}
        {!isLoading && !error && userName && (
          <>
            <h1 className="text-4xl font-bold text-white text-center mb-8">Misi 3: Atmosfer</h1>
            {renderQuiz()}
          </>
        )}
      </div>
    </div>
  );
};

export default Mission3;