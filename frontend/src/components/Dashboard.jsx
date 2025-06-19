import { useState, useEffect } from 'react';
import AngketModal from './Angket/AngketModal';

const Dashboard = ({ totalScore: initialTotalScore = 0, userName }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentTotalScore, setCurrentTotalScore] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTotalScore = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leaderboard`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const userScore = data
          .filter((entry) => entry.username === userName)
          .reduce((sum, entry) => sum + (Number(entry.total_score) || 0), 0) || 0;
        setCurrentTotalScore(userScore);
      } catch (error) {
        console.error('Error fetching total score:', error);
        const numericScore = Number(initialTotalScore) || 0;
        setCurrentTotalScore(numericScore);
      }
    };
    fetchTotalScore();
  }, [userName, initialTotalScore]);

  const getScoreLevel = (score) => {
    const numericScore = Number(score) || 0;
    if (numericScore >= 100) return { level: 'Master', color: 'text-amber-100', bg: 'from-amber-700/80 to-red-800/80', icon: '👑' };
    if (numericScore >= 75) return { level: 'Expert', color: 'text-teal-100', bg: 'from-teal-700/80 to-cyan-800/80', icon: '🎖️' };
    if (numericScore >= 50) return { level: 'Advanced', color: 'text-emerald-100', bg: 'from-emerald-700/80 to-green-800/80', icon: '🌟' };
    if (numericScore >= 25) return { level: 'Intermediate', color: 'text-yellow-100', bg: 'from-yellow-700/80 to-orange-800/80', icon: '🏅' };
    return { level: 'Beginner', color: 'text-gray-100', bg: 'from-gray-700/80 to-slate-800/80', icon: '🎯' };
  };

  const scoreInfo = getScoreLevel(currentTotalScore);
  const currentLevelThreshold = Math.floor(currentTotalScore / 25) * 25;
  const nextLevelThreshold = currentLevelThreshold + 25;
  const progress = Math.min(((currentTotalScore - currentLevelThreshold) / 25) * 100, 100);
  const progressPercentage = `${progress.toFixed(1)}%`;

  const formatScore = (score) => String(score).replace(/^0+/, '') || '0';

  const gameCards = [
    {
      id: 'data',
      title: 'Tanah Data',
      icon: '⛏️',
      description: 'Gali harta karun informasi di kedalaman tanah NurMath!',
      color: 'from-amber-700/80 to-brown-800/80',
      shadowColor: 'shadow-amber-600/30',
      path: 'Data/DataPage',
    },
    {
      id: 'diagram',
      title: 'Daratan Diagram',
      icon: '🪨',
      description: 'Jelajahi dataran luas visualisasi di gurun pengetahuan!',
      color: 'from-sand-700/80 to-orange-800/80',
      shadowColor: 'shadow-orange-600/30',
      path: '/diagram',
    },
    {
      id: 'leaderboard',
      title: 'Langit Informasi',
      icon: '☁️',
      description: 'Terbang tinggi, lihat peringkat penjelajah sejati di langit NurMath!',
      color: 'from-sky-700/80 to-cyan-800/80',
      shadowColor: 'shadow-cyan-600/30',
      path: '/leaderboard',
    },
    {
      id: 'survey',
      title: 'Luar Angkasa Representasi',
      icon: '🌌',
      description: 'Ciptakan bintang baru dengan masukanmu di galaksi NurMath!',
      color: 'from-indigo-700/80 to-purple-800/80',
      shadowColor: 'shadow-purple-600/30',
      action: () => setIsModalOpen(true),
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-merriweather">
      {/* Enhanced Background with Animated Layers */}
      <div className="fixed inset-0 bg-gradient-to-br from-amber-900/90 via-brown-900/90 to-orange-900/90">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath fill="rgba(139,69,19,0.3)" d="M0 0h100v10H0zM0 20h100v10H0zM0 40h100v10H0zM0 60h100v10H0zM0 80h100v10H0z"/%3E%3C/svg%3E')`,
            backgroundSize: '120px 120px',
            animation: 'scroll 30s linear infinite',
          }}
        />
        <div
          className="absolute inset-0 opacity-15 animate-wind"
          style={{
            backgroundImage: `linear-gradient(45deg, transparent 40%, rgba(255,215,0,0.2) 42%, rgba(255,215,0,0.2) 44%, transparent 46%)`,
            animationDuration: '10s',
          }}
        />
        <div
          className="absolute inset-0 opacity-20 animate-pulse"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,107,0,0.2) 0%, transparent 80%)`,
            animationDuration: '8s',
          }}
        />
      </div>

      {/* Enhanced Animated Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-amber-500/40 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              boxShadow: '0 0 8px rgba(255, 191, 0, 0.5)',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-8 text-gray-100">
        <div className="mx-auto max-w-7xl">
          {/* Header with Enhanced Visuals */}
          <div className="relative mb-16 text-center">
            <div className="inline-block bg-gradient-to-b from-amber-800/95 to-brown-900/95 p-10 rounded-3xl border-4 border-amber-600/50 shadow-[0_10px_30px_rgba(255,107,0,0.3)] backdrop-blur-xl">
              <div
                className="absolute top-0 flex items-center justify-center w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 border-4 rounded-full left-1/2 bg-amber-700/80 border-amber-500/60 animate-pulse"
                style={{
                  backgroundImage: `radial-gradient(circle, rgba(255,215,0,0.2) 20%, transparent 60%)`,
                  boxShadow: '0 0 15px rgba(255, 191, 0, 0.4)',
                }}
              >
                <span className="text-3xl">🧭</span>
              </div>
              <h1 className="text-5xl font-extrabold text-amber-100 mb-6 drop-shadow-[0_2px_4px_rgba(139,69,19,0.7)] tracking-tight font-cinzel">
                Selamat Datang di Dunia NurMath!
              </h1>
              <p className="max-w-2xl mx-auto mb-6 text-xl italic text-gray-100 font-lora">
                📜 "Ilmu adalah harta karun, hanya penjelajah sejati yang dapat menemukannya."
              </p>
              <p className="max-w-2xl mx-auto mb-8 text-base leading-relaxed text-gray-100">
                Masuki dunia epik NurMath, tempat petualangan dan pengetahuan menyatu! Bersama NurM, satukan elemen ilmu yang terserak di alam semesta ini!
              </p>
              <button className="group relative px-8 py-3 bg-gradient-to-r from-amber-600/90 to-orange-700/90 rounded-xl text-amber-100 font-bold hover:-translate-y-1 transition-all duration-300 shadow-[0_6px_20px_rgba(255,107,0,0.3)]">
                <span className="relative z-10">Mulai Petualangan</span>
                <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-amber-500/30 rounded-xl group-hover:opacity-100" />
              </button>
            </div>
            <div
              className="absolute inset-0 pointer-events-none opacity-15"
              style={{
                backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath stroke="rgba(255,215,0,0.2)" stroke-width="2" fill="none" d="M10 10L30 50L50 20L70 60L90 30"/%3E%3C/svg%3E')`,
                backgroundSize: '250px 250px',
              }}
            />
          </div>

          {/* User Info - Enhanced Horizontal Layout */}
          <div className="mb-16 text-center">
            <div className="inline-block bg-gradient-to-r from-stone-800/95 to-brown-900/95 p-6 rounded-2xl border-4 border-amber-600/60 shadow-[0_8px_25px_rgba(255,107,0,0.3)] backdrop-blur-xl w-full max-w-4xl">
              <div className="flex items-center justify-between gap-8 px-6">
                <div className="flex items-center gap-3">
                  <span className="text-amber-100 text-xl font-bold drop-shadow-[0_1px_3px_rgba(139,69,">Penjelajah: {(userName?.split(' ')[0]) || 'Tamu'}</span>
                  <span className="text-2xl text-amber-500 animate-pulse">🪓</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base text-gray-100">Level:</span>
                  <span
                    className={`px-4 py-2 rounded-xl ${scoreInfo.bg} ${scoreInfo.color} font-bold text-base shadow-[0_4px_12px_rgba(255,107,0,0.3)] transform hover:-translate-y-1 transition-all duration-300`}
                  >
                    {scoreInfo.icon} {scoreInfo.level}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base text-gray-100">Poin Ilmu:</span>
                  <span className="relative text-base font-bold text-amber-100 group">
                    <span className="relative z-10">📜 {formatScore(currentTotalScore)}</span>
                    <span className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-amber-500/20 rounded-xl group-hover:opacity-100" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Cards with Enhanced Animations */}
          <div className="grid max-w-5xl grid-cols-1 gap-8 mx-auto md:grid-cols-2">
            {gameCards.map((card) => {
              const CardComponent = card.path ? 'a' : 'button';
              const cardProps = card.path ? { href: card.path } : { onClick: card.action };

              return (
                <CardComponent
                  key={card.id}
                  {...cardProps}
                  className="block group"
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div
                    className={`
                      relative bg-gradient-to-br ${card.color} rounded-3xl p-8
                      transform transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl
                      border-4 border-amber-600/50 ${card.shadowColor}
                      backdrop-blur-xl overflow-hidden
                      ${hoveredCard === card.id ? 'border-amber-500/70 shadow-[0_0_20px_rgba(255,191,0,0.4)] scale-105' : ''}
                    `}
                  >
                    <div
                      className="absolute inset-0 transition-transform transform -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent group-hover:translate-x-full duration-600"
                    />
                    <div className="relative z-10 flex gap-6">
                      <span className="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 drop-shadow-lg">
                        {card.icon}
                      </span>
                      <div>
                        <h3 className="mb-3 text-xl font-extrabold transition-colors duration-300 text-amber-100 group-hover:text-amber-200">
                          {card.title}
                        </h3>
                        <p className="text-base leading-relaxed text-gray-100">{card.description}</p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-6">
                      <span className="px-4 py-2 text-sm font-bold transition-all duration-300 bg-amber-600/60 rounded-xl text-amber-100 group-hover:bg-amber-600/80 group-hover:scale-105">
                        {card.path ? 'JELAJAHI' : 'BUKA'} →
                      </span>
                    </div>
                    {hoveredCard === card.id && (
                      <div
                        className="absolute inset-0 pointer-events-none opacity-15 animate-pulse"
                        style={{
                          backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath stroke="rgba(255,215,0,0.3)" stroke-width="3" fill="none" d="M20 20L40 60L60 30L80 70"/%3E%3C/svg%3E')`,
                          backgroundSize: '180px 180px',
                        }}
                      />
                    )}
                  </div>
                </CardComponent>
              );
            })}
          </div>

          {/* Progress Bar with Enhanced Visuals */}
          <div className="max-w-5xl mx-auto mt-16">
            <div className="p-8 border-4 shadow-2xl bg-gradient-to-br from-amber-800/95 to-brown-900/95 rounded-3xl border-amber-600/60 backdrop-blur-xl">
              <h3 className="mb-6 text-xl font-extrabold text-center text-amber-100 font-cinzel">
                📜 Perjalanan Menuju Pencerahan
              </h3>
              <div className="relative">
                <div className="w-full h-4 overflow-hidden border-2 rounded-full bg-gray-900/60 border-amber-500/50">
                  <div
                    className="relative h-full transition-all duration-1000 rounded-full bg-gradient-to-r from-amber-500/80 to-orange-700/80"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-amber-500/30 animate-pulse" />
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-amber-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                      {progressPercentage}
                    </span>
                  </div>
                </div>
                <div className="mt-6 text-base text-center text-gray-100">
                  <p>
                    Level Saat Ini: {scoreInfo.icon} {scoreInfo.level} ({currentLevelThreshold} Poin)
                  </p>
                  <p>
                    Level Berikutnya: {getScoreLevel(nextLevelThreshold).icon}{' '}
                    {getScoreLevel(nextLevelThreshold).level} ({nextLevelThreshold} Poin)
                  </p>
                  <p className="mt-3 font-semibold text-amber-100">
                    Sisa: {nextLevelThreshold - currentTotalScore} Poin untuk naik level
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal with Enhanced Styling */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-900/60 backdrop-blur-xl">
          <div className="p-8 border-4 shadow-2xl bg-gradient-to-br from-amber-800/90 to-brown-900/90 rounded-3xl border-amber-600/60 backdrop-blur-xl">
            <h2 className="mb-6 text-2xl font-extrabold text-amber-100 font-cinzel">Luar Angkasa Representasi</h2>
            <p className="mb-6 text-base text-gray-100">Berikan masukan untuk membentuk galaksi NurMath!</p>
            <button
              className="px-6 py-3 bg-amber-600/80 rounded-xl text-amber-100 font-bold hover:bg-amber-600/95 hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_12px_rgba(255,107,0,0.3)]"
              onClick={() => setIsModalOpen(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Custom CSS for Animations */}
      <style>{`
        @keyframes scroll {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 120px 120px;
          }
        }
        @keyframes wind {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 1000px 1000px;
          }
        }
        @keyframes float {
          0% {
            transform: translateY(0);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-20px);
            opacity: 0.4;
          }
          100% {
            transform: translateY(0);
            opacity: 0.8;
          }
        }
      `}</style>
      

      {/* Angket Modal */}
      <AngketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Footer */}
    </div>
  );
};

export default Dashboard;