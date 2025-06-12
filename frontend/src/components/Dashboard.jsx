import { useState } from 'react';
import { Link } from 'react-router-dom';
import AngketModal from './Angket/AngketModal';

const Dashboard = ({ totalScore, userName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const getScoreLevel = (score) => {
    if (score >= 100) return { level: "Master", color: "text-purple-400", bg: "from-purple-600 to-pink-600" };
    if (score >= 75) return { level: "Expert", color: "text-blue-400", bg: "from-blue-600 to-cyan-600" };
    if (score >= 50) return { level: "Advanced", color: "text-green-400", bg: "from-green-600 to-emerald-600" };
    if (score >= 25) return { level: "Intermediate", color: "text-yellow-400", bg: "from-yellow-600 to-orange-600" };
    return { level: "Beginner", color: "text-gray-400", bg: "from-gray-600 to-slate-600" };
  };

  const scoreInfo = getScoreLevel(totalScore);

  const gameCards = [
    {
      id: 'data',
      title: 'Data',
      icon: '📊',
      description: 'Jelajahi dunia data',
      color: 'from-blue-500 to-blue-700',
      shadowColor: 'shadow-blue-500/50',
      path: '/data'
    },
    {
      id: 'diagram',
      title: 'Diagram',
      icon: '📈',
      description: 'Petualangan diagram',
      color: 'from-emerald-500 to-emerald-700',
      shadowColor: 'shadow-emerald-500/50',
      path: '/diagram'
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      icon: '🏆',
      description: 'Papan peringkat',
      color: 'from-yellow-500 to-orange-600',
      shadowColor: 'shadow-yellow-500/50',
      path: '/leaderboard'
    },
    {
      id: 'survey',
      title: 'Angket Kepuasan',
      icon: '📝',
      description: 'Berikan masukan',
      color: 'from-purple-500 to-purple-700',
      shadowColor: 'shadow-purple-500/50',
      action: () => setIsModalOpen(true)
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 font-comic-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-green-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-yellow-400/10 rounded-full blur-xl animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-pulse">
              🎮 NURMATH UNIVERSE 🎮
            </h1>
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Selamat Datang, <span className="text-cyan-400">{userName || 'Player'}</span>!
              </h2>
              <div className="flex items-center justify-center gap-4">
                <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${scoreInfo.bg} text-white font-bold`}>
                  Level: {scoreInfo.level}
                </div>
                <div className="text-3xl font-bold text-yellow-400 animate-bounce">
                  ⭐ {totalScore} XP
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {gameCards.map((card) => {
            const CardComponent = card.path ? Link : 'button';
            const cardProps = card.path ? { to: card.path } : { onClick: card.action };
            
            return (
              <CardComponent
                key={card.id}
                {...cardProps}
                className="group block"
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`
                  relative bg-gradient-to-br ${card.color} rounded-3xl p-8 
                  transform transition-all duration-500 hover:scale-110 hover:-rotate-2
                  shadow-2xl ${card.shadowColor} hover:shadow-3xl
                  border-2 border-white/20 hover:border-white/40
                  overflow-hidden cursor-pointer
                  ${hoveredCard === card.id ? 'animate-pulse' : ''}
                `}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-6xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
                      {card.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-200 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-white/80 text-sm group-hover:text-white transition-colors">
                      {card.description}
                    </p>
                    <div className="mt-4 flex justify-center">
                      <div className="px-6 py-2 bg-white/20 rounded-full text-white font-semibold group-hover:bg-white/30 transition-all duration-300">
                        {card.path ? 'MULAI' : 'BUKA'} →
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </CardComponent>
            );
          })}
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Progress ke Level Selanjutnya</h3>
            <div className="relative">
              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${scoreInfo.bg} rounded-full transition-all duration-1000 relative`}
                  style={{ width: `${Math.min((totalScore % 25) * 4, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-400">
                <span>{Math.floor(totalScore / 25) * 25} XP</span>
                <span>{(Math.floor(totalScore / 25) + 1) * 25} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AngketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userName={userName} />
    </div>
  );
};

export default Dashboard;