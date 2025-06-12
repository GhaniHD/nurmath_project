import { Link } from 'react-router-dom';
import { useState } from 'react';

const DataPage = ({ totalScore, userName }) => {
  const [hoveredMission, setHoveredMission] = useState(null);

  const getScoreLevel = (score) => {
    if (score >= 100) return { level: "Master", color: "text-purple-400", bg: "from-purple-600 to-pink-600" };
    if (score >= 75) return { level: "Expert", color: "text-blue-400", bg: "from-blue-600 to-cyan-600" };
    if (score >= 50) return { level: "Advanced", color: "text-green-400", bg: "from-green-600 to-emerald-600" };
    if (score >= 25) return { level: "Intermediate", color: "text-yellow-400", bg: "from-yellow-600 to-orange-600" };
    return { level: "Beginner", color: "text-gray-400", bg: "from-gray-600 to-slate-600" };
  };

  const scoreInfo = getScoreLevel(totalScore);

  const missions = [
    {
      id: 'misi-1',
      title: 'Misi 1: Kerak Bumi',
      description: 'Jelajahi data kerak bumi dengan spinwheel',
      icon: '🌍',
      available: true,
      color: 'from-green-500 to-emerald-600',
      shadowColor: 'shadow-green-500/50',
      path: '/data/misi-1'
    },
    {
      id: 'misi-2',
      title: 'Misi 2: Lautan Dalam',
      description: 'Pilih kotak misteri untuk data lautan',
      icon: '🌊',
      available: true,
      color: 'from-blue-500 to-cyan-600',
      shadowColor: 'shadow-blue-500/50',
      path: '/data/misi-2'
    },
    {
      id: 'misi-3',
      title: 'Misi 3: Atmosfer',
      description: 'Uji pengetahuan data dengan kuis',
      icon: '☁️',
      available: true,
      color: 'from-purple-500 to-indigo-600',
      shadowColor: 'shadow-purple-500/50',
      path: '/data/misi-3'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 font-comic-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-green-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-cyan-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent mb-4 animate-pulse">
              📊 DATA UNIVERSE 📊
            </h1>
            <h2 className="text-3xl font-bold text-white mb-4">Petualangan Ilmu Data</h2>
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6">
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Pemain</p>
                  <p className="text-cyan-400 font-bold text-lg">{userName || 'Guest'}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Level</p>
                  <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${scoreInfo.bg} text-white font-bold text-sm`}>
                    {scoreInfo.level}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Total XP</p>
                  <p className="text-yellow-400 font-bold text-xl animate-bounce">⭐ {totalScore}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          {missions.map((mission) => {
            const MissionComponent = mission.available ? Link : 'div';
            const missionProps = mission.available ? { to: mission.path } : {};
            return (
              <MissionComponent
                key={mission.id}
                {...missionProps}
                className={`group ${mission.available ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                onMouseEnter={() => setHoveredMission(mission.id)}
                onMouseLeave={() => setHoveredMission(null)}
              >
                <div className={`
                  relative bg-gradient-to-br ${mission.color} rounded-3xl p-6 
                  transform transition-all duration-500 
                  ${mission.available ? 'hover:scale-105 hover:-rotate-1' : 'opacity-60'}
                  shadow-2xl ${mission.shadowColor} hover:shadow-3xl
                  border-2 border-white/20 hover:border-white/40
                  overflow-hidden
                  ${hoveredMission === mission.id && mission.available ? 'animate-pulse' : ''}
                `}>
                  {mission.available && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  )}
                  <div className="relative z-10 flex items-center gap-6">
                    <div className={`text-6xl transform ${mission.available ? 'group-hover:scale-125' : ''} transition-transform duration-300`}>
                      {mission.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className={`text-2xl font-bold text-white mb-2 ${mission.available ? 'group-hover:text-yellow-200' : ''} transition-colors`}>
                        {mission.title}
                      </h3>
                      <p className="text-white/80 text-sm mb-3">
                        {mission.description}
                      </p>
                      <div className="flex items-center gap-2">
                        {mission.available ? (
                          <div className="px-4 py-2 bg-white/20 rounded-full text-white font-semibold text-sm group-hover:bg-white/30 transition-all duration-300">
                            MULAI MISI →
                          </div>
                        ) : (
                          <div className="px-4 py-2 bg-gray-600/50 rounded-full text-gray-300 font-semibold text-sm">
                            🔒 TERKUNCI
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {mission.available && (
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </div>
              </MissionComponent>
            );
          })}
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">🎯 Progress Misi Data</h3>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-green-400 font-bold">3</div>
                <div className="text-gray-400 text-sm">Tersedia</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-gray-400 font-bold">0</div>
                <div className="text-gray-400 text-sm">Terkunci</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-yellow-400 font-bold">0</div>
                <div className="text-gray-400 text-sm">Selesai</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPage;