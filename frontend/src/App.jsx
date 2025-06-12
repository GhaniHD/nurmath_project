import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SpinWheel from './components/SpinWheel';
import StoryTelling from './components/StoryTelling';
import Leaderboard from './components/Leaderboard';
import DataPage from './components/DataPage';
import DiagramPage from './components/DiagramPage';
import NameModal from './components/NameModal';
import AdminPage from './components/Admin/AdminPage';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  const [totalScore, setTotalScore] = useState(0);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [isNameModalOpen, setIsNameModalOpen] = useState(!userName);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-200 via-blue-300 to-green-200 font-comic-sans text-gray-800">
      <div className="p-6">
        <h1 className="text-4xl font-bold text-yellow-600 mb-2 text-center">NURMATH - Petualangan Ilmu</h1>
        <p className="text-lg text-gray-700 mb-6 text-center">Game Edukatif untuk SMP</p>
        <NameModal isOpen={isNameModalOpen} onSubmit={handleNameSubmit} />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard totalScore={totalScore} userName={userName} />} />
            <Route path="/story-telling" element={<StoryTelling />} />
            <Route path="/data" element={<DataPage totalScore={totalScore} userName={userName} />} />
            <Route path="/diagram" element={<DiagramPage />} />
            <Route path="/leaderboard" element={<Leaderboard userName={userName} />} />
            <Route path="/data/misi-1" element={<SpinWheel missionId="misi-1" onComplete={handleComplete} userName={userName} />} />
            <Route path="/data/misi-2" element={<div className="text-center">Misi 2 - Data (Coming Soon)</div>} />
            <Route path="/data/misi-3" element={<div className="text-center">Misi 3 - Data (Coming Soon)</div>} />
            <Route path="/diagram/misi-1" element={<div className="text-center">Misi 1 - Diagram (Coming Soon)</div>} />
            <Route path="/diagram/misi-2" element={<div className="text-center">Misi 2 - Diagram (Coming Soon)</div>} />
            <Route path="/diagram/misi-3" element={<div className="text-center">Misi 3 - Diagram (Coming Soon)</div>} />
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