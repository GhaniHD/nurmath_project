// src/components/Mission2.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Mission2 = ({ missionId, onComplete, userName }) => { // onComplete and userName from props
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedPgOrYaTidak, setSelectedPgOrYaTidak] = useState(null); // For PG/Ya-Tidak
  const [userIsianSingkat, setUserIsianSingkat] = useState(''); // For Isian Singkat
  const [checkedAnswers, setCheckedAnswers] = useState([]); // For Ceklis
  const [dragItem, setDragItem] = useState(null); // For Drag and Drop
  const [dropTargetAnswers, setDropTargetAnswers] = useState({}); // For Drag and Drop, store matched items
  const [result, setResult] = useState(null); // true/false for correctness
  const [showFeedback, setShowFeedback] = useState(false); // To control feedback display
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/questions/${missionId}`);
        const data = await response.json();
        if (response.ok) {
          const mission2Types = ['drag-and-drop', 'isian-singkat', 'ceklis', 'pg', 'ya-tidak']; // isian-singkat is repeated as per your request
          const filteredQuestions = data.filter(q => mission2Types.includes(q.type));
          setQuestions(filteredQuestions);
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

  const handleSubmitAnswer = async (answer) => {
    let isCorrect = false;
    switch (currentQuestion.type) {
      case 'pg':
      case 'ya-tidak':
        isCorrect = answer === currentQuestion.correctAnswer;
        break;
      case 'isian-singkat':
        isCorrect = answer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
        break;
      case 'ceklis':
        // Sort both arrays to ensure order doesn't affect comparison
        isCorrect = JSON.stringify(answer.sort()) === JSON.stringify(currentQuestion.correctAnswer.sort());
        break;
      case 'drag-and-drop':
        // correct answer for drag and drop stored as "Item1 -> TargetA,Item2 -> TargetB"
        // user's answer is an object: { TargetA: Item1, TargetB: Item2 }
        const correctMatches = currentQuestion.correctAnswer.split(',').sort().join(','); // e.g., "10 -> Kecil,20 -> Sedang,30 -> Besar"
        const userMatchesArray = Object.keys(dropTargetAnswers).map(target => `${dropTargetAnswers[target]} -> ${target}`);
        const userMatches = userMatchesArray.sort().join(',');
        isCorrect = userMatches === correctMatches;
        break;
      default:
        isCorrect = false;
    }

    setResult(isCorrect);
    setShowFeedback(true);
    const score = isCorrect ? currentQuestion.score : 0;
    
    // Call onComplete from props to update totalScore in App.js
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

    setTimeout(() => {
      if (isCorrect && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        resetQuestionState();
      } else if (isCorrect && currentQuestionIndex === questions.length - 1) {
        alert('Misi selesai! Selamat!');
        navigate('/leaderboard');
      }
    }, 1500);
  };

  const resetQuestionState = () => {
    setSelectedPgOrYaTidak(null);
    setUserIsianSingkat('');
    setCheckedAnswers([]);
    setDragItem(null);
    setDropTargetAnswers({});
    setResult(null);
    setShowFeedback(false);
  };

  const handleDragStart = (e, item) => {
    setDragItem(item);
    e.dataTransfer.setData('text/plain', item);
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain');
    setDropTargetAnswers(prev => ({ ...prev, [target]: item }));
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Allow drop
  };

  const handleCheckboxChange = (option) => {
    setCheckedAnswers((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'drag-and-drop':
        return (
          <div className="text-center">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg shadow-inner border border-gray-600">
                <p className="text-white mb-2 font-semibold">Item untuk ditarik:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentQuestion.options.map((option, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => handleDragStart(e, option)}
                      className="p-3 bg-blue-500 text-white rounded-lg cursor-grab hover:bg-blue-600 transition-colors shadow-md"
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg shadow-inner border border-gray-600">
                <p className="text-white mb-2 font-semibold">Target:</p>
                <div className="flex flex-col gap-2 w-full">
                  {currentQuestion.targets.map((target, idx) => (
                    <div
                      key={idx}
                      onDrop={(e) => handleDrop(e, target)}
                      onDragOver={handleDragOver}
                      className="p-3 bg-gray-600 text-white rounded-lg flex items-center justify-center min-h-[50px] border-dashed border-2 border-gray-500"
                    >
                      {dropTargetAnswers[target] ? (
                        <span className="bg-blue-400 px-2 py-1 rounded">{dropTargetAnswers[target]}</span>
                      ) : (
                        `Seret ke sini: ${target}`
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSubmitAnswer(dropTargetAnswers)}
              disabled={Object.keys(dropTargetAnswers).length !== currentQuestion.targets.length || showFeedback}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Submit
            </button>
          </div>
        );
      case 'isian-singkat':
        return (
          <div className="text-center">
            <input
              type="text"
              value={userIsianSingkat}
              onChange={(e) => setUserIsianSingkat(e.target.value)}
              placeholder="Masukkan jawaban singkat..."
              className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={showFeedback}
            />
            <button
              onClick={() => handleSubmitAnswer(userIsianSingkat)}
              disabled={!userIsianSingkat.trim() || showFeedback}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Submit
            </button>
          </div>
        );
      case 'ceklis':
        return (
          <div className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {currentQuestion.options.map((option, idx) => (
                <label key={idx} className="flex items-center p-3 bg-gray-700 rounded-lg text-white cursor-pointer hover:bg-gray-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedAnswers.includes(option)}
                    onChange={() => handleCheckboxChange(option)}
                    className="mr-3 w-5 h-5 accent-blue-500"
                    disabled={showFeedback}
                  />
                  {option}
                </label>
              ))}
            </div>
            <button
              onClick={() => handleSubmitAnswer(checkedAnswers)}
              disabled={checkedAnswers.length === 0 || showFeedback}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Submit
            </button>
          </div>
        );
      case 'pg':
      case 'ya-tidak':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedPgOrYaTidak(option); // Highlight selection
                  handleSubmitAnswer(option); // Submit on click
                }}
                className={`p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600
                  ${selectedPgOrYaTidak === option ? 'ring-4 ring-yellow-400' : ''}
                  ${showFeedback ? (option === currentQuestion.correctAnswer ? 'bg-green-500' : (selectedPgOrYaTidak === option ? 'bg-red-500' : '')) : ''}
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                `}
                disabled={showFeedback}
              >
                {option}
              </button>
            ))}
          </div>
        );
      default:
        return <p className="text-red-400">Tipe pertanyaan tidak dikenal.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-cyan-900 p-6 flex items-center justify-center font-comic-sans">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-2xl w-full shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center animate-fade-in">Misi 2: Lautan Dalam</h2>
        <div className="text-xl font-semibold text-white mb-4 text-center">
          {currentQuestion.questionText}
        </div>

        {renderQuestionInput()}

        {showFeedback && (
          <div className={`mt-6 text-lg text-center font-bold ${result ? 'text-green-400' : 'text-red-400'} animate-fade-in`}>
            {result ? `Benar! Kamu mendapatkan ${currentQuestion.score} XP!` : 'Salah, coba lagi!'}
          </div>
        )}

        {!showFeedback && currentQuestionIndex === questions.length - 1 && (
          <p className="mt-4 text-center text-gray-300">Selesaikan pertanyaan ini untuk menyelesaikan misi!</p>
        )}
      </div>
    </div>
  );
};

export default Mission2;