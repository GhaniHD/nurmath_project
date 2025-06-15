import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Leaderboard = ({ userName = 'Player123' }) => {
  const { missionId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load leaderboard dari localStorage saat komponen dimuat pertama kali
  useEffect(() => {
    const savedLeaderboard = localStorage.getItem('leaderboard');
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard));
    }

    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:3001/api/leaderboard`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLeaderboard(data);
        localStorage.setItem('leaderboard', JSON.stringify(data)); // Simpan ke localStorage
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Gagal memuat leaderboard. Coba lagi nanti.');
        // Gunakan data dari localStorage jika server gagal
        const savedData = localStorage.getItem('leaderboard');
        if (savedData) setLeaderboard(JSON.parse(savedData));
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []); // Kosongkan dependency array agar hanya dipanggil sekali saat mount

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-500 to-yellow-600 border-yellow-400';
      case 2: return 'from-gray-400 to-gray-500 border-gray-300';
      case 3: return 'from-orange-500 to-orange-600 border-orange-400';
      default: return 'from-blue-500 to-blue-600 border-blue-400';
    }
  };

  const isCurrentPlayer = (playerName) => playerName === userName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-orange-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-amber-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-4 animate-pulse">
            🏆 HALL OF CHAMPIONS 🏆
          </h1>
          <h2 className="text-3xl font-bold text-white mb-4">
            Leaderboard {missionId ? `- ${missionId.toUpperCase()}` : 'Global'}
          </h2>
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6">
            <p className="text-gray-400 text-sm mb-2">Your Champion Name</p>
            <div className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full text-white font-bold text-lg inline-block">
              ⚡ {userName || 'Guest'} ⚡
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12 text-red-400">
            <p className="text-xl font-bold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent"></div>
            <p className="text-white mt-4 text-lg">Loading champions...</p>
          </div>
        )}

        {/* Leaderboard List */}
        {!loading && !error && (
          <div className="max-w-3xl mx-auto">
            {leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  const isPlayer = isCurrentPlayer(entry.username); // Sesuaikan dengan 'username' dari server
                  return (
                    <div
                      key={entry.id || entry.user_id} // Sesuaikan dengan field ID dari server
                      className={`group relative transform transition-all duration-500 hover:scale-105 ${isPlayer ? 'ring-4 ring-cyan-400 ring-opacity-50 animate-pulse' : ''}`}
                    >
                      <div className={`relative bg-gradient-to-r ${getRankClass(rank)} rounded-2xl p-6 shadow-2xl hover:shadow-3xl border-2 overflow-hidden ${isPlayer ? 'border-cyan-400' : ''}`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                              <div className="text-4xl">{getRankIcon(rank)}</div>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-white">#{rank}</div>
                                {rank <= 3 && (
                                  <div className="text-yellow-200 text-xs font-semibold">
                                    {rank === 1 ? 'LEGEND' : rank === 2 ? 'MASTER' : 'EXPERT'}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-bold text-white">{entry.username}</h3>
                                {isPlayer && (
                                  <span className="px-3 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full animate-bounce">YOU</span>
                                )}
                              </div>
                              {rank <= 3 && (
                                <p className="text-yellow-200 text-sm mt-1">
                                  {rank === 1 ? '🎯 Perfect Score Master!' :
                                   rank === 2 ? '🎪 Amazing Performance!' :
                                   '🌟 Excellent Work!'}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-white mb-1">{entry.total_score || entry.score}</div>
                            <div className="text-yellow-200 text-sm font-semibold">XP POINTS</div>
                          </div>
                        </div>
                        {rank <= 3 && (
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-white mb-4">No Champions Yet!</h3>
                <p className="text-gray-400 text-lg">Be the first to complete missions and claim your spot on the leaderboard!</p>
              </div>
            )}
          </div>
        )}

        {/* Stats Section */}
        {!loading && !error && leaderboard.length > 0 && (
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 text-center">📊 Leaderboard Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center bg-yellow-600/20 rounded-xl p-4">
                  <div className="text-2xl mb-2">👑</div>
                  <div className="text-2xl font-bold text-yellow-400">{Math.max(...leaderboard.map(entry => entry.total_score || entry.score))}</div>
                  <div className="text-yellow-200 text-sm">Top Score</div>
                </div>
                <div className="text-center bg-blue-600/20 rounded-xl p-4">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-2xl font-bold text-blue-400">{leaderboard.length}</div>
                  <div className="text-blue-200 text-sm">Total Players</div>
                </div>
                <div className="text-center bg-green-600/20 rounded-xl p-4">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="text-2xl font-bold text-green-400">{(leaderboard.reduce((sum, entry) => sum + (entry.total_score || entry.score), 0) / leaderboard.length).toFixed(2)}</div>
                  <div className="text-green-200 text-sm">Avg XP</div>
                </div>
                <div className="text-center bg-red-600/20 rounded-xl p-4">
                  <div className="text-2xl mb-2">📉</div>
                  <div className="text-2xl font-bold text-red-400">{Math.min(...leaderboard.map(entry => entry.total_score || entry.score))}</div>
                  <div className="text-red-200 text-sm">Lowest XP</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;