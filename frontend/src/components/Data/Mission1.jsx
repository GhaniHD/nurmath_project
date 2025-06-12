import { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';

  const Mission1 = ({ missionId, onComplete, userName }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [selected, setSelected] = useState(null);
    const [result, setResult] = useState(null);
    const [answer, setAnswer] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
      const fetchQuestions = async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/questions/${missionId}`);
          const data = await response.json();
          if (response.ok) {
            setQuestions(data);
          } else {
            console.error('Fetch error:', data.error);
          }
        } catch (err) {
          console.error('Error fetching questions:', err);
        }
      };
      fetchQuestions();
    }, [missionId]);

    if (questions.length === 0) return <div className="text-center text-white text-2xl font-comic-sans">Loading...</div>;

    const currentQuestion = questions[currentQuestionIndex];

    const handleSubmit = async (userAnswer) => {
      setSpinning(true);
      setTimeout(async () => {
        setSpinning(false);
        let isCorrect = false;
        if (currentQuestion.type === 'pg') {
          isCorrect = userAnswer === currentQuestion.correctAnswer;
        } else if (currentQuestion.type === 'benar-salah') {
          isCorrect = userAnswer === currentQuestion.correctAnswer;
        } else if (currentQuestion.type === 'audio-menjodohkan') {
          isCorrect = userAnswer === currentQuestion.correctAnswer;
        } else if (currentQuestion.type === 'uraian') {
          isCorrect = userAnswer.toLowerCase().includes(currentQuestion.correctAnswer.toLowerCase());
        } else if (currentQuestion.type === 'gambar-isian') {
          isCorrect = userAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
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
            setSelected(null);
            setResult(null);
            setAnswer('');
          }, 1000);
        }
      }, 2000);
    };

    const spin = () => {
      setSpinning(true);
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * currentQuestion.options.length);
        setSelected(currentQuestion.options[randomIndex]);
        setSpinning(false);
        if (currentQuestion.type === 'pg' || currentQuestion.type === 'benar-salah') {
          handleSubmit(currentQuestion.options[randomIndex]);
        }
      }, 2000);
    };

    if (!currentQuestion) return <div className="text-center text-white text-2xl font-comic-sans">No questions available</div>;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-900 p-6 flex items-center justify-center font-comic-sans">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Misi 1: Kerak Bumi</h2>
          <h3 className="text-xl font-semibold text-white mb-4">{currentQuestion.questionText}</h3>
          
          {currentQuestion.type === 'pg' && (
            <div className="text-center">
              <div className={`w-64 h-64 mx-auto bg-green-200 rounded-full flex items-center justify-center ${spinning ? 'animate-spin' : ''}`}>
                <p className="text-lg">{selected || 'Putar!'}</p>
              </div>
              <button
                onClick={spin}
                disabled={spinning || result !== null}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                Putar Roda
              </button>
            </div>
          )}

          {currentQuestion.type === 'benar-salah' && (
            <div className="text-center">
              <div className={`w-64 h-64 mx-auto bg-green-200 rounded-full flex items-center justify-center ${spinning ? 'animate-spin' : ''}`}>
                <p className="text-lg">{selected || 'Putar!'}</p>
              </div>
              <button
                onClick={spin}
                disabled={spinning || result !== null}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                Putar Roda
              </button>
            </div>
          )}

          {currentQuestion.type === 'audio-menjodohkan' && (
            <div className="text-center">
              <audio src={currentQuestion.audioUrl} controls className="mb-4" />
              <select
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="p-2 rounded bg-gray-700 text-white"
              >
                <option value="">Pilih pasangan</option>
                {currentQuestion.options.map((option, idx) => (
                  <option key={idx} value={option}>{option}</option>
                ))}
              </select>
              <button
                onClick={() => handleSubmit(answer)}
                disabled={spinning || !answer}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                Submit
              </button>
            </div>
          )}

          {currentQuestion.type === 'uraian' && (
            <div className="text-center">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Tulis jawabanmu..."
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <button
                onClick={() => handleSubmit(answer)}
                disabled={spinning || !answer}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                Submit
              </button>
            </div>
          )}

          {currentQuestion.type === 'gambar-isian' && (
            <div className="text-center">
              <img src={currentQuestion.imageUrl} alt="Question" className="mb-4 max-w-xs mx-auto" />
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Masukkan jawaban..."
                className="p-2 rounded bg-gray-700 text-white"
              />
              <button
                onClick={() => handleSubmit(answer)}
                disabled={spinning || !answer}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                Submit
              </button>
            </div>
          )}

          {result !== null && (
            <>
              <p className="mt-4 text-lg text-center">{result ? `Benar! Skor: ${currentQuestion.score}` : 'Salah, coba lagi!'}</p>
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

  export default Mission1;