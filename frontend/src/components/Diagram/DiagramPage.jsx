import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const DataPage = ({ totalScore: initialTotalScore = 0, userName }) => {
  const [hoveredMission, setHoveredMission] = useState(null);
  const [currentTotalScore, setCurrentTotalScore] = useState(0);

  // Fetch atau sinkronisasi totalScore dari server
  useEffect(() => {
    const fetchTotalScore = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/leaderboard');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const userScore = data
          .filter(entry => entry.username === userName)
          .reduce((sum, entry) => sum + (Number(entry.total_score) || 0), 0) || 0;
        setCurrentTotalScore(userScore);
        console.log('Fetched totalScore for', userName, ':', userScore);
      } catch (error) {
        console.error('Error fetching total score:', error);
        const numericScore = Number(initialTotalScore) || 0;
        if (isNaN(numericScore)) {
          console.warn('initialTotalScore tidak valid, diatur ke 0:', initialTotalScore);
        }
        setCurrentTotalScore(numericScore);
      }
    };

    fetchTotalScore();
  }, [userName]);

  const getScoreLevel = (score) => {
    const numericScore = Number(score) || 0;
    if (numericScore >= 100) return { level: "Galactic Explorer", color: "text-purple-300", bg: "from-purple-600/60 to-indigo-600/60", icon: "🌌" };
    if (numericScore >= 75) return { level: "Sky Navigator", color: "text-blue-300", bg: "from-blue-600/60 to-cyan-600/60", icon: "☁️" };
    if (numericScore >= 50) return { level: "Earth Guardian", color: "text-green-300", bg: "from-green-600/60 to-emerald-600/60", icon: "🌳" };
    if (numericScore >= 25) return { level: "Land Scout", color: "text-yellow-300", bg: "from-yellow-600/60 to-orange-600/60", icon: "🏞️" };
    return { level: "Seedling", color: "text-gray-300", bg: "from-gray-600/60 to-brown-600/60", icon: "🌱" };
  };

  const scoreInfo = getScoreLevel(currentTotalScore);

  const formatScore = (score) => {
    return String(score).replace(/^0+/, ''); // Menghapus nol di depan
  };

  const missions = [
    {
      id: 'misi-1',
      title: 'Misi 1 – Daratan Ilmu',
      description: 'Telusuri dataran luas untuk mengumpulkan potongan data dari bumi yang retak. Bantu NurM memetakan jejak pengetahuan!',
      icon: '🏞️',
      available: true,
      completed: false,
      color: 'from-green-700/50 to-yellow-700/50',
      shadowColor: 'shadow-green-500/20',
      path: '/diagram/misi-1'
    },
    {
      id: 'misi-2',
      title: 'Misi 2 – Langit Fakta',
      description: 'Terbang bersama NurM di langit biru untuk mengumpulkan informasi dari awan data yang melayang. Pilih teknik terbaik!',
      icon: '☁️',
      available: true,
      completed: false,
      color: 'from-blue-700/50 to-cyan-700/50',
      shadowColor: 'shadow-blue-500/20',
      path: '/diagram/misi-2'
    },
    {
      id: 'misi-3',
      title: 'Misi 3 – Luar Angkasa Pengetahuan',
      description: 'Jelajahi luar angkasa dengan NurM untuk menyaring fakta dari galaksi data tak berujung. Navigasi dengan bijak!',
      icon: '🌌',
      available: true,
      completed: false,
      color: 'from-purple-700/50 to-indigo-700/50',
      shadowColor: 'shadow-purple-500/20',
      path: '/diagram/misi-3'
    }
  ];

  // Hitung statistik misi
  const availableMissions = missions.filter(m => m.available).length;
  const lockedMissions = missions.filter(m => !m.available).length;
  const completedMissions = missions.filter(m => m.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900/80 via-blue-900/30 to-gray-800/80 p-8 font-cinzel text-gray-200 overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Background motif: Earth-like pattern with clouds and stars */}
        <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent,20px,rgba(0,100,0,0.05),20px,rgba(0,150,150,0.2)] animate-drift-pattern"></div>
        {/* Glowing effects: Earthy glows */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-green-500/30 rounded-full shadow-[0_0_10px_rgba(0,255,0,0.5)] animate-spark-1"></div>
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-blue-500/30 rounded-full shadow-[0_0_10px_rgba(0,102,204,0.5)] animate-spark-2"></div>
        {/* Pulsing earth rune glow */}
        <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full shadow-[0_0_15px_rgba(0,255,0,0.3)] animate-rune-pulse"></div>
        <div className="absolute bottom-1/3 left-3/4 w-5 h-5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full shadow-[0_0_12px_rgba(128,0,128,0.3)] animate-rune-pulse delay-1s"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto animate-fade-in">
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-b from-gray-900/80 to-green-800/30 rounded-2xl p-8 border-4 border-green-700/30 shadow-[0_0_15px_rgba(0,255,0,0.3)] backdrop-blur-sm">
            <h1 className="text-5xl font-bold text-green-200 mb-4 drop-shadow-[0_2px_3px_rgba(0,255,0,0.5)]">
              Peta Petualang Bumi NurMath
            </h1>
            <h2 className="text-2xl font-semibold text-gray-200 mb-6">
              Jelajahi Jejak Alam Semesta</h2>
            <div className="bg-gray-900/30 rounded-lg p-4 border border-green-600/20">
              <div className="flex items-center gap-8 justify-between">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Petualang</p>
                  <p className="text-green-200 font-bold text-lg font-semibold">{userName || 'Tamu'}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Level</p>
                  <div className={`px-4 py-1 rounded-lg bg-gradient-to-r ${scoreInfo.bg} text-gray-200 font-bold text-sm shadow-[0_0_8px_rgba(0,255,0,0.2)]`}>
                    {scoreInfo.level} {scoreInfo.icon}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Poin Ilmu</p>
                  <p className="text-green-200 font-bold text-xl animate-pulse">🌍 {formatScore(currentTotalScore)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {missions.map((mission, index) => {
            const MissionComponent = mission.available ? Link : 'div';
            const missionProps = mission.available ? { to: mission.path } : {};
            return (
              <MissionComponent
                key={mission.id}
                {...missionProps}
                className={`group ${mission.available ? 'cursor-pointer' : 'cursor-not-allowed'} animate-slide-in delay-${index * 200}`}
                onMouseEnter={() => setHoveredMission(mission.id)}
                onMouseLeave={() => setHoveredMission(null)}
              >
                <div className={`
                  relative bg-gradient-to-br ${mission.color} rounded-xl p-6 
                  transform transition-all duration-500 
                  ${mission.available ? 'hover:scale-105 hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(0,255,0,0.5)]' : 'opacity-50'}
                  shadow-md ${mission.shadowColor} 
                  border-2 border-green-600/20 hover:border-green-600/40
                  overflow-hidden backdrop-blur-sm
                  ${hoveredMission === mission.id && mission.available ? 'animate-glow' : ''}
                `}>
                  {mission.available && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                  )}
                  <div className="relative z-10 flex items-start gap-4">
                    <div className={`text-4xl transform ${mission.available ? 'group-hover:scale-110' : ''} transition-transform duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
                      {mission.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold text-green-200 mb-2 ${mission.available ? 'group-hover:text-green-300' : ''} transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]`}>
                        {mission.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-4 font-medium leading-relaxed">
                        {mission.description}
                      </p>
                      <div className="flex items-center gap-2">
                        {mission.available ? (
                          mission.completed ? (
                            <div className="px-3 py-1 bg-green-600/50 rounded-full text-green-200 font-semibold text-xs shadow-[0_0_5px_rgba(0,255,0,0.3)]">
                              SELESAI ✓
                            </div>
                          ) : (
                            <div className="px-3 py-1 bg-green-600/50 rounded-full text-green-200 font-semibold text-xs group-hover:bg-green-600/70 transition-all duration-300 shadow-[0_0_5px_rgba(0,255,0,0.3)]">
                              MULAI PETUALANGAN →
                            </div>
                          )
                        ) : (
                          <div className="px-3 py-1 bg-gray-600/50 rounded-full text-gray-400 font-semibold text-xs">
                            🔒 TERKUNCI
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </MissionComponent>
            );
          })}
        </div>

        <div className="mt-12 max-w-4xl mx-auto animate-slide-in delay-600">
          <div className="bg-gradient-to-b from-gray-900/80 to-green-800/30 rounded-xl p-6 border-4 border-gray-700/30 shadow-[0_0_15px_rgba(0,255,0,0.3)] backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-green-200 mb-4 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">🌍 Catatan Petualangan</h3>
            <div className="flex justify-between gap-4">
              <div className="text-center flex-1">
                <div className="text-2xl mb-2 text-green-300">✅</div>
                <div className="text-green-200 font-bold text-sm">{availableMissions}</div>
                <div className="text-gray-400 text-xs">Tersedia</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-2xl mb-2 text-gray-400">🔒</div>
                <div className="text-green-200 font-bold text-sm">{lockedMissions}</div>
                <div className="text-gray-400 text-xs">Terkunci</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-2xl mb-2 text-yellow-200">🏆</div>
                <div className="text-green-200 font-bold text-sm">{completedMissions}</div>
                <div className="text-gray-400 text-xs">Selesai</div>
              </div>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2 mt-4">
              <div className="bg-green-600/70 h-2 rounded-full transition-all duration-500" style={{ width: `${(completedMissions / missions.length) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPage;