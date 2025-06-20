import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL;

const DataPage = ({ totalScore: initialTotalScore = 0, userName }) => {
  const [hoveredMission, setHoveredMission] = useState(null);
  const [currentTotalScore, setCurrentTotalScore] = useState(0);

  // Fetch atau sinkronisasi totalScore dari server
  useEffect(() => {
    const fetchTotalScore = async () => {
      try {
        const response = await fetch(`${API_URL}/api/leaderboard`);
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
    if (numericScore >= 100) return { level: "Master", color: "text-amber-300", bg: "from-amber-600/60 to-red-600/60", icon: "👑" };
    if (numericScore >= 75) return { level: "Expert", color: "text-blue-300", bg: "from-blue-600/60 to-cyan-600/60", icon: "🎖️" };
    if (numericScore >= 50) return { level: "Advanced", color: "text-green-300", bg: "from-green-600/60 to-emerald-600/60", icon: "🌟" };
    if (numericScore >= 25) return { level: "Intermediate", color: "text-yellow-300", bg: "from-yellow-600/60 to-orange-600/60", icon: "🏅" };
    return { level: "Beginner", color: "text-gray-300", bg: "from-gray-600/60 to-slate-600/60", icon: "🎯" };
  };

  const scoreInfo = getScoreLevel(currentTotalScore);

  const formatScore = (score) => {
    return String(score).replace(/^0+/, ''); // Menghapus nol di depan
  };

  const missions = [
    {
      id: 'misi-1',
      title: 'Misi 1 – Batuan Ilmu Retak',
      description: 'Gunung pengetahuan meletus! Bantu NurM mengumpulkan kembali potongan data dari pecahan batuan awal dunia.',
      icon: '🔥',
      available: true,
      completed: false,
      color: 'from-red-700/50 to-amber-700/50',
      shadowColor: 'shadow-red-500/20',
      path: '/data/misi-1'
    },
    {
      id: 'misi-2',
      title: 'Misi 2 – Tanah Data yang Hilang',
      description: 'NurM harus menggali informasi tersembunyi dalam lapisan-lapisan tanah. Ayo bantu memilih teknik pengumpulan data yang tepat!',
      icon: '⛏️',
      available: true,
      completed: false,
      color: 'from-amber-700/50 to-brown-700/50',
      shadowColor: 'shadow-amber-500/20',
      path: '/data/misi-2'
    },
    {
      id: 'misi-3',
      title: 'Misi 3 – Arus Lautan Fakta',
      description: 'Lautan NurMath penuh data tak beraturan. Bantu NurM menavigasi arus informasi dan menyaring fakta yang benar!',
      icon: '🌊',
      available: true,
      completed: false,
      color: 'from-blue-700/50 to-cyan-700/50',
      shadowColor: 'shadow-blue-500/20',
      path: '/data/misi-3'
    }
  ];

  // Hitung statistik misi
  const availableMissions = missions.filter(m => m.available).length;
  const lockedMissions = missions.filter(m => !m.available).length;
  const completedMissions = missions.filter(m => m.completed).length;

  return (
    <div className="relative min-h-screen p-8 overflow-hidden text-gray-200 bg-gradient-to-br from-gray-800/80 via-amber-900/30 to-gray-800/80 font-cinzel">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Background motif: Repeating rune-like pattern */}
        <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent,20px,rgba(255,200,100,0.05),20px,rgba(255,200,0,0.2)] animate-drift-pattern"></div>
        {/* Glowing spark effect */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-amber-500/30 rounded-full shadow-[0_0_10px_rgba(255,107,0,0.5)] animate-spark-1"></div>
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-blue-500/30 rounded-full shadow-[0_0_10px_rgba(0,102,204,0.5)] animate-spark-2"></div>
        {/* Pulsing rune glow */}
        <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-full shadow-[0_0_15px_rgba(255,107,0,0.3)] animate-rune-pulse"></div>
        <div className="absolute bottom-1/3 left-3/4 w-5 h-5 bg-gradient-to-r from-amber-500/20 to-red-500/20 rounded-full shadow-[0_0_12px_rgba(255,0,0,0.3)] animate-rune-pulse delay-1s"></div>
      </div>

      {/* Back to Dashboard Button */}
      <div className="fixed z-20 top-4 left-4">
        <Link
          to="/"
          className="group relative px-4 py-2 bg-gradient-to-r from-amber-600/80 to-orange-700/80 rounded-lg text-amber-200 font-semibold text-sm shadow-[0_4px_12px_rgba(255,107,0,0.3)] hover:-translate-y-1 transition-all duration-300"
        >
          <span className="relative z-10">← Kembali ke Dashboard</span>
          <div className="absolute inset-0 transition-opacity duration-300 rounded-lg opacity-0 bg-amber-500/30 group-hover:opacity-100" />
        </Link>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto animate-fade-in">
        <div className="mb-12 text-center">
          <div className="inline-block bg-gradient-to-b from-gray-900/80 to-gray-800/30 rounded-2xl p-8 border-4 border-amber-700/30 shadow-[0_0_15px_rgba(255,107,0,0.3)] backdrop-blur-sm">
            <h1 className="text-5xl font-bold text-amber-200 mb-4 drop-shadow-[0_2px_3px_rgba(255,107,0,0.5)]">
              Peta Petualang NurMath
            </h1>
            <h2 className="mb-6 text-2xl font-semibold text-gray-200">
              Telusuri Jejak Ilmu</h2>
            <div className="p-4 border rounded-lg bg-gray-900/30 border-amber-600/20">
              <div className="flex items-center justify-between gap-8">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Petualang</p>
                  <p className="text-lg font-semibold font-bold text-amber-200">{userName || 'Tamu'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Level</p>
                  <div className={`px-4 py-1 rounded-lg bg-gradient-to-r ${scoreInfo.bg} text-gray-200 font-bold text-sm shadow-[0_0_8px_rgba(255,107,0,0.2)]`}>
                    {scoreInfo.level} {scoreInfo.icon}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Poin Ilmu</p>
                  <p className="text-xl font-bold text-yellow-200 animate-pulse">📜 {formatScore(currentTotalScore)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid max-w-4xl grid-cols-1 gap-8 mx-auto md:grid-cols-2">
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
                  ${mission.available ? 'hover:scale-105 hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(255,107,0,0.5)]' : 'opacity-50'}
                  shadow-md ${mission.shadowColor} 
                  border-2 border-amber-600/20 hover:border-amber-600/40
                  overflow-hidden backdrop-blur-sm
                  ${hoveredMission === mission.id && mission.available ? 'animate-glow' : ''}
                `}>
                  {mission.available && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                  )}
                  <div className="relative z-10 flex items-start gap-4">
                    <div className={`text-4xl transform ${mission.available ? 'group-hover:scale-110' : ''} transition-transform duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
                      {mission.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold text-amber-200 mb-2 ${mission.available ? 'group-hover:text-amber-300' : ''} transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]`}>
                        {mission.title}
                      </h3>
                      <p className="mb-4 text-sm font-medium leading-relaxed text-gray-300">
                        {mission.description}
                      </p>
                      <div className="flex items-center gap-2">
                        {mission.available ? (
                          mission.completed ? (
                            <div className="px-3 py-1 bg-green-600/50 rounded-full text-amber-200 font-semibold text-xs shadow-[0_0_5px_rgba(0,255,0,0.3)]">
                              SELESAI ✓
                            </div>
                          ) : (
                            <div className="px-3 py-1 bg-amber-600/50 rounded-full text-amber-200 font-semibold text-xs group-hover:bg-amber-600/70 transition-all duration-300 shadow-[0_0_5px_rgba(255,107,0,0.3)]">
                              MULAI PETUALANGAN →
                            </div>
                          )
                        ) : (
                          <div className="px-3 py-1 text-xs font-semibold text-gray-400 rounded-full bg-gray-600/50">
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

        <div className="max-w-4xl mx-auto mt-12 animate-slide-in delay-600">
          <div className="bg-gradient-to-b from-gray-900/80 to-gray-800/30 rounded-xl p-6 border-4 border-gray-700/30 shadow-[0_0_15px_rgba(255,107,0,0.3)] backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-amber-200 mb-4 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">📜 Catatan Petualangan</h3>
            <div className="flex justify-between gap-4">
              <div className="flex-1 text-center">
                <div className="mb-2 text-2xl text-green-300">✅</div>
                <div className="text-sm font-bold text-amber-200">{availableMissions}</div>
                <div className="text-xs text-gray-400">Tersedia</div>
              </div>
              <div className="flex-1 text-center">
                <div className="mb-2 text-2xl text-gray-400">🔒</div>
                <div className="text-sm font-bold text-amber-200">{lockedMissions}</div>
                <div className="text-xs text-gray-400">Terkunci</div>
              </div>
              <div className="flex-1 text-center">
                <div className="mb-2 text-2xl text-yellow-200">🏆</div>
                <div className="text-sm font-bold text-amber-200">{completedMissions}</div>
                <div className="text-xs text-gray-400">Selesai</div>
              </div>
            </div>
            <div className="w-full h-2 mt-4 rounded-full bg-gray-700/50">
              <div className="h-2 transition-all duration-500 rounded-full bg-amber-600/70" style={{ width: `${(completedMissions / missions.length) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPage;