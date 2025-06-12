import { useState } from 'react';

// Mock Link component for demonstration
const Link = ({ to, children, ...props }) => (
  <div {...props} onClick={() => alert(`Navigate to: ${to}`)}>
    {children}
  </div>
);

const DiagramPage = () => {
  const [hoveredMission, setHoveredMission] = useState(null);

  const missions = [
    {
      id: 'misi-1',
      title: 'Misi 1: Grafik Dasar',
      description: 'Coming Soon',
      icon: '📊',
      available: false,
      color: 'from-gray-500 to-gray-600',
      shadowColor: 'shadow-gray-500/30'
    },
    {
      id: 'misi-2',
      title: 'Misi 2: Chart Master',
      description: 'Coming Soon',
      icon: '📈',
      available: false,
      color: 'from-gray-500 to-gray-600',
      shadowColor: 'shadow-gray-500/30'
    },
    {
      id: 'misi-3',
      title: 'Misi 3: Data Visualizer',
      description: 'Coming Soon',
      icon: '📉',
      available: false,
      color: 'from-gray-500 to-gray-600',
      shadowColor: 'shadow-gray-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-indigo-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-4 animate-pulse">
              📈 DIAGRAM UNIVERSE 📈
            </h1>
            <h2 className="text-3xl font-bold text-white mb-4">Petualangan Ilmu Diagram</h2>
            
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Status Diagram Quest</p>
                <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold inline-block">
                  🚧 Dalam Pengembangan 🚧
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          {missions.map((mission) => {
            const MissionComponent = mission.available ? Link : 'div';
            const missionProps = mission.available ? { to: `/diagram/${mission.id}` } : {};
            
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
                  {/* Shimmer Effect for Available Missions */}
                  {mission.available && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  )}
                  
                  {/* Mission Content */}
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
                      
                      {/* Mission Status */}
                      <div className="flex items-center gap-2">
                        {mission.available ? (
                          <div className="px-4 py-2 bg-white/20 rounded-full text-white font-semibold text-sm group-hover:bg-white/30 transition-all duration-300">
                            MULAI MISI →
                          </div>
                        ) : (
                          <div className="px-4 py-2 bg-gray-600/50 rounded-full text-gray-300 font-semibold text-sm">
                            🔒 SEGERA HADIR
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Glow Effect */}
                  {mission.available && (
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </div>
              </MissionComponent>
            );
          })}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-400/20">
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-4">Segera Hadir!</h3>
              <p className="text-purple-200 mb-6">
                Misi-misi diagram yang menantang sedang dalam tahap pengembangan. 
                Bersiaplah untuk petualangan visualisasi data yang luar biasa!
              </p>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-purple-600/20 rounded-xl p-4">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-purple-200 text-sm">Bar Charts</div>
                </div>
                <div className="bg-pink-600/20 rounded-xl p-4">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="text-pink-200 text-sm">Line Graphs</div>
                </div>
                <div className="bg-indigo-600/20 rounded-xl p-4">
                  <div className="text-2xl mb-2">🥧</div>
                  <div className="text-indigo-200 text-sm">Pie Charts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramPage;