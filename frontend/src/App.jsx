import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SpinWheel from './components/SpinWheel';
import Leaderboard from './components/Leaderboard';
import DataPage from './components/DataPage';
import DiagramPage from './components/DiagramPage';
import NameModal from './components/NameModal';
import AdminPage from './components/Admin/AdminPage';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';

const App = () => {
  const [totalScore, setTotalScore] = useState(0);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [isNameModalOpen, setIsNameModalOpen] = useState(!userName);

  const [showSplash, setShowSplash] = useState(() => {
    const hasSeenSplash = localStorage.getItem('nurmath_splash_seen');
    return hasSeenSplash !== 'true';
  });

  const navigate = useNavigate();

  const handleNameSubmit = (name) => {
    setUserName(name);
    localStorage.setItem('userName', name);
    setIsNameModalOpen(false);
  };

  const handleComplete = async (score, missionId) => {
    setTotalScore((prev) => prev + score);
    if (score > 0 && userName) {
      await fetch('http://localhost:5000/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, score, missionId }),
      });
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    localStorage.setItem('nurmath_splash_seen', 'true');
    navigate('/');
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    // Apply the Dashboard's background classes here
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-comic-sans text-gray-800">
      <div className="p-6">
        <h1 className="text-4xl font-bold text-yellow-600 mb-2 text-center">NURMATH - Petualangan Ilmu</h1>
        <p className="text-lg text-gray-700 mb-6 text-center">Game Edukatif untuk SMP</p>
        <NameModal isOpen={isNameModalOpen} onSubmit={handleNameSubmit} />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard totalScore={totalScore} userName={userName} />} />
            <Route path="/data" element={<DataPage totalScore={totalScore} userName={userName} />} />
            <Route path="/diagram" element={<DiagramPage />} />
            <Route path="/leaderboard" element={<Leaderboard userName={userName} />} />
            <Route path="/data/misi-1" element={<SpinWheel missionId="misi-1" onComplete={handleComplete} userName={userName} />} />
            <Route path="/data/misi-2" element={<div className="text-center text-white text-3xl mt-20">Misi 2 - Data (Coming Soon)</div>} />
            <Route path="/data/misi-3" element={<div className="text-center text-white text-3xl mt-20">Misi 3 - Data (Coming Soon)</div>} />
            <Route path="/diagram/misi-1" element={<div className="text-center text-white text-3xl mt-20">Misi 1 - Diagram (Coming Soon)</div>} />
            <Route path="/diagram/misi-2" element={<div className="text-center text-white text-3xl mt-20">Misi 2 - Diagram (Coming Soon)</div>} />
            <Route path="/diagram/misi-3" element={<div className="text-center text-white text-3xl mt-20">Misi 3 - Diagram (Coming Soon)</div>} />
            <Route path="/admin/questions" element={<AdminPage />} />
            <Route path="/admin/leaderboard" element={<AdminPage />} />
            <Route path="/admin/feedback" element={<AdminPage />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default App;