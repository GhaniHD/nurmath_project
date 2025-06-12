import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SpinWheel = ({ missionId, onComplete, userName }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch(`http://localhost:5000/api/questions/${missionId}`);
      const data = await response.json();
      setQuestions(data);
    };
    fetchQuestions();
  }, [missionId]);

  if (questions.length === 0) return <div>Loading...</div>;

  const currentQuestion = questions[currentQuestionIndex];

  const spin = async () => {
    setSpinning(true);
    setTimeout(async () => {
      const randomIndex = Math.floor(Math.random() * currentQuestion.options.length);
      setSelected(currentQuestion.options[randomIndex]);
      setSpinning(false);
      const isCorrect = currentQuestion.options[randomIndex] === currentQuestion.correctAnswer;
      setResult(isCorrect);
      
      const score = isCorrect ? currentQuestion.score : 0;
      onComplete(score, missionId);

      // Submit to leaderboard if correct and userName exists
      if (isCorrect && userName) {
        try {
          await fetch('http://localhost:5000/api/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, score, missionId }),
          });
        } catch (err) {
          console.error('Error submitting to leaderboard:', err);
        }
      }

      if (isCorrect && currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
          setSelected(null);
          setResult(null);
        }, 1000);
      }
    }, 2000);
  };

  return (
    <div className="text-center">
      <h3 className="text-xl font-bold mb-4">{currentQuestion.questionText}</h3>
      <div className={`w-64 h-64 mx-auto bg-blue-200 rounded-full flex items-center justify-center ${spinning ? 'animate-spin' : ''}`}>
        <p className="text-lg">{selected || 'Putar!'}</p>
      </div>
      <button
        onClick={spin}
        disabled={spinning || result !== null}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Putar Roda
      </button>
      {result !== null && (
        <>
          <p className="mt-4 text-lg">{result ? `Benar! Skor: ${currentQuestion.score}` : 'Salah, coba lagi!'}</p>
          {currentQuestionIndex === questions.length - 1 && (
            <button
              onClick={() => navigate(`/data/${missionId}/leaderboard`)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Lihat Leaderboard
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default SpinWheel;