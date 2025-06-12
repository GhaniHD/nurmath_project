import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Mission2 = ({ missionId, onComplete, userName }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedBox, setSelectedBox] = useState(null);
  const [result, setResult] = useState(null);
  const [answer, setAnswer] = useState([]);
  const [dragItem, setDragItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/questions/misi-2`);
        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        console.error('Error fetching questions:', err);
      }
    };
    fetchQuestions();
  }, []);

  if (questions.length === 0) return <div className="text-center text-white text-2xl font-comic-sans">Loading...</div>;

  const currentQuestion = questions[currentQuestionIndex];

  const handleBoxClick = (box) => {
    setSelectedBox(box);
    if (currentQuestion.type === 'pg' || currentQuestion.type === 'ya-tidak') {
      handleSubmit(box);
    }
  };

  const handleSubmit = async (userAnswer) => {
    let isCorrect = false;
    if (currentQuestion.type === 'pg' || currentQuestion.type === 'ya-tidak') {
      isCorrect = userAnswer === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'isian-singkat') {
      isCorrect = userAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    } else if (currentQuestion.type === 'ceklis') {
      isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(currentQuestion.correctAnswer.sort());
    } else if (currentQuestion.type === 'drag-and-drop') {
      isCorrect = userAnswer === currentQuestion.correctAnswer;
    }
    setResult(isCorrect);
    const score = isCorrect ? currentQuestion.score : 0;
    onComplete(score, missionId);

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

    if (isCorrect && currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedBox(null);
        setResult(null);
        setAnswer([]);
        setDragItem(null);
      }, 1000);
    }
  };

  const handleDragStart = (item) => setDragItem(item);
  const handleDrop = (target) => {
    if (dragItem) {
      handleSubmit(`${dragItem} -> ${target}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-cyan-900 p-6 flex items-center justify-center font-comic-sans">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Misi 2: Lautan Dalam</h2>
        <h3 className="text-xl font-semibold text-white mb-4">{currentQuestion.questionText}</h3>

        {currentQuestion.type === 'drag-and-drop' && (
          <div className="text-center">
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((option, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => handleDragStart(option)}
                  className="p-4 bg-blue-500 text-white rounded cursor-move"
                >
                  {option}
                </div>
              ))}
              {currentQuestion.targets.map((target, idx) => (
                <div
                  key={idx}
                  onDrop={() => handleDrop(target)}
                  onDragOver={(e) => e.preventDefault()}
                  className="p-4 bg-gray-700 text-white rounded"
                >
                  {target}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentQuestion.type === 'isian-singkat' && (
          <div className="text-center">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Masukkan jawaban..."
              className="p-2 rounded bg-gray-700 text-white"
            />
            <button
              onClick={() => handleSubmit(answer)}
              disabled={!answer}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              Submit
            </button>
          </div>
        )}

        {currentQuestion.type === 'ceklis' && (
          <div className="text-center">
            {currentQuestion.options.map((option, idx) => (
              <label key={idx} className="block text-white">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const newAnswer = answer.includes(option)
                      ? answer.filter((a) => a !== option)
                      : [...answer, option];
                    setAnswer(newAnswer);
                  }}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
            <button
              onClick={() => handleSubmit(answer)}
              disabled={answer.length === 0}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              Submit
            </button>
          </div>
        )}

        {(currentQuestion.type === 'pg' || currentQuestion.type === 'ya-tidak') && (
          <div className="grid grid-cols-2 gap-4">
            {currentQuestion.options.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleBoxClick(option)}
                className={`p-4 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 ${
                  selectedBox === option ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        )}

        {result !== null && (
          <>
            <p className="mt-4 text-lg text-center text-white">{result ? `Benar! Skor: ${currentQuestion.score}` : 'Salah, coba lagi!'}</p>
            {currentQuestionIndex === questions.length - 1 && (
              <button
                onClick={() => navigate(`/leaderboard`)}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Lihat Leaderboard
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Mission2;