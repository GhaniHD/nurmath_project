import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard/Leaderboard';
import DataPage from './components/Data/DataPage';
import Mission1 from './components/Data/Mission1';
import Mission2 from './components/Data/Mission2';
import Mission3 from './components/Data/Mission3';
import DiagramPage from './components/Diagram/DiagramPage';
import DiagramCrosswordGame from './components/Diagram/Mission1';
import Mission1Diagram from './components/Diagram/Mission2';
import Mission2Diagram from './components/Diagram/Mission3';
import AdminPage from './components/Admin/AdminPage';
import NameModal from './components/NameModal';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';
import AngketModal from './components/Angket/AngketModal';
import './App.css'; // Import your CSS file

const App = () => {
  const [totalScore, setTotalScore] = useState(Number(localStorage.getItem('totalScore')) || 0);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [isNameModalOpen, setIsNameModalOpen] = useState(!localStorage.getItem('userName'));
  const [showSplash, setShowSplash] = useState(() => localStorage.getItem('nurmath_splash_seen') !== 'true');
  const [showAngketModal, setShowAngketModal] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchTotalScore = async () => {
      if (userName) {
        try {
          const response = await fetch(`${API_URL}/api/leaderboard`);
          const data = await response.json();
          if (response.ok) {
            if (Array.isArray(data)) {
              const userScores = data.filter(entry => entry.username === userName);
              const total = userScores.reduce((sum, entry) => sum + entry.totalScore, 0);
              setTotalScore(total);
              localStorage.setItem('totalScore', total);
            } else {
              console.warn('Data leaderboard bukan array:', data);
              setError('Format data leaderboard tidak valid.');
            }
          } else {
            setError(data.error || 'Gagal memuat skor.');
          }
        } catch (err) {
          console.error('Gagal memuat skor:', err);
          setError('Koneksi gagal. Silakan coba lagi.');
        }
      }
    };
    fetchTotalScore();
  }, [userName, API_URL]);

  const handleNameSubmit = ({ userId: generatedId, userName: savedName }) => {
    // Simpan ke localStorage
    localStorage.setItem('userId', generatedId);
    localStorage.setItem('userName', savedName);
  
    // Update state
    setUserId(generatedId);
    setUserName(savedName);
  
    // Tutup modal
    setIsNameModalOpen(false);
  };

  const handleComplete = async (score, missionId) => {
    const storedUserId = userId || localStorage.getItem('userId');
    const storedUserName = userName || localStorage.getItem('userName');

    if (score > 0 && storedUserName && storedUserId) {
      try {
        const response = await fetch(`${API_URL}/api/leaderboard`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: storedUserId,
            userName: typeof storedUserName === 'string' && storedUserName.includes('{')
              ? JSON.parse(storedUserName).userName
              : storedUserName,
            score,
            missionId
          }),
        });

        if (response.ok) {
          const newScore = totalScore + score;
          setTotalScore(newScore);
          localStorage.setItem('totalScore', newScore);
        } else {
          console.warn('Gagal mengirim skor:', await response.text());
        }
      } catch (err) {
        console.error('Error submitting score:', err);
        setError('Koneksi gagal saat mengirim skor.');
      }
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    localStorage.setItem('nurmath_splash_seen', 'true');
    navigate('/', { state: { fromSplash: true } });
  };

  const toggleAngketModal = () => {
    setShowAngketModal(!showAngketModal);
  };

  if (showSplash) {
    return (
      <div className="transition-opacity duration-1000 opacity-100">
        <SplashScreen onFinish={handleSplashFinish} />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-comic-sans text-gray-800">
      {error && (
        <div className="fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 px-2 py-1 bg-blue-500 rounded hover:bg-blue-600"
          >
            Tutup
          </button>
        </div>
      )}
        <NameModal isOpen={isNameModalOpen} onSubmit={handleNameSubmit} />
        <AngketModal isOpen={showAngketModal} onClose={toggleAngketModal} />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard totalScore={totalScore} userName={userName} onAngketClick={toggleAngketModal} />} />
            <Route path="/data" element={<DataPage totalScore={totalScore} userName={userName} />} />
            <Route path="/diagram" element={<DiagramPage />} />
            <Route path="/leaderboard" element={<Leaderboard userName={userName} />} />
            <Route path="/data/misi-1" element={<Mission1 missionId="misi-1" onComplete={handleComplete} />} />
            <Route path="/data/misi-2" element={<Mission2 missionId="misi-2" onComplete={handleComplete} />} />
            <Route path="/data/misi-3" element={<Mission3 missionId="misi-3" onComplete={handleComplete} />} />
            <Route path="/diagram/misi-1" element={<DiagramCrosswordGame missionId="misi-4" onComplete={handleComplete} />} />
            <Route path="/diagram/misi-2" element={<Mission1Diagram missionId="misi-2" onComplete={handleComplete} />} />
            <Route path="/diagram/misi-3" element={<Mission2Diagram missionId="misi-3" onComplete={handleComplete} />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/questions" element={<AdminPage />} />
            <Route path="/admin/leaderboard" element={<AdminPage />} />
            <Route path="/admin/feedback" element={<AdminPage />} />
          </Routes>
        </ErrorBoundary>
      </div>
  );
};

export default App;
