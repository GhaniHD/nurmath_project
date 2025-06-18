import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Leaderboard = ({ userName = 'Player123' }) => {
  const { missionId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leaderboard`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLeaderboard(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Gagal memuat leaderboard. Coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

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
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-32 h-32 rounded-full top-20 left-10 bg-yellow-400/10 blur-xl animate-pulse"></div>
        <div className="absolute w-24 h-24 delay-1000 rounded-full top-40 right-20 bg-orange-400/10 blur-xl animate-pulse"></div>
        <div className="absolute rounded-full bottom-32 left-1/4 w-28 h-28 bg-amber-400/10 blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text animate-pulse">
            🏆 HALL OF CHAMPIONS 🏆
          </h1>
          <h2 className="mb-4 text-3xl font-bold text-white">
            Leaderboard {missionId ? `- ${missionId.toUpperCase()}` : 'Global'}
          </h2>
          <div className="p-4 mb-6 border bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border-white/10">
            <p className="mb-2 text-sm text-gray-400">Your Champion Name</p>
            <div className="inline-block px-6 py-2 text-lg font-bold text-white rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
              ⚡ {userName || 'Guest'} ⚡
            </div>
          </div>
        </div>

        {error && (
          <div className="py-12 text-center text-red-400">
            <p className="text-xl font-bold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
        )}

        {loading && !error && (
          <div className="py-12 text-center">
            <div className="inline-block w-16 h-16 border-4 border-yellow-400 rounded-full animate-spin border-t-transparent"></div>
            <p className="mt-4 text-lg text-white">Loading champions...</p>
          </div>
        )}

        {!loading && !error && (
          <div className="max-w-3xl mx-auto">
            {leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  const isPlayer = isCurrentPlayer(entry.username);
                  return (
                    <div
                      key={entry.id || entry.user_id}
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
                                  <div className="text-xs font-semibold text-yellow-200">
                                    {rank === 1 ? 'LEGEND' : rank === 2 ? 'MASTER' : 'EXPERT'}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-bold text-white">{entry.username}</h3>
                                {isPlayer && (
                                  <span className="px-3 py-1 text-xs font-bold text-white rounded-full bg-cyan-500 animate-bounce">YOU</span>
                                )}
                              </div>
                              {rank <= 3 && (
                                <p className="mt-1 text-sm text-yellow-200">
                                  {rank === 1 ? '🎯 Perfect Score Master!' :
                                   rank === 2 ? '🎪 Amazing Performance!' :
                                   '🌟 Excellent Work!'}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="mb-1 text-3xl font-bold text-white">{entry.total_score || entry.score}</div>
                            <div className="text-sm font-semibold text-yellow-200">XP POINTS</div>
                          </div>
                        </div>
                        {rank <= 3 && (
                          <div className="absolute inset-0 opacity-50 rounded-2xl bg-gradient-to-br from-white/10 to-transparent"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mb-4 text-6xl">🏆</div>
                <h3 className="mb-4 text-2xl font-bold text-white">No Champions Yet!</h3>
                <p className="text-lg text-gray-400">Be the first to complete missions and claim your spot on the leaderboard!</p>
              </div>
            )}
          </div>
        )}

        {!loading && !error && leaderboard.length > 0 && (
          <div className="max-w-3xl mx-auto mt-12">
            <div className="p-6 border bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl border-white/10">
              <h3 className="mb-6 text-xl font-semibold text-center text-white">📊 Leaderboard Stats</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="p-4 text-center bg-yellow-600/20 rounded-xl">
                  <div className="mb-2 text-2xl">👑</div>
                  <div className="text-2xl font-bold text-yellow-400">{Math.max(...leaderboard.map(entry => entry.total_score || entry.score))}</div>
                  <div className="text-sm text-yellow-200">Top Score</div>
                </div>
                <div className="p-4 text-center bg-blue-600/20 rounded-xl">
                  <div className="mb-2 text-2xl">👥</div>
                  <div className="text-2xl font-bold text-blue-400">{leaderboard.length}</div>
                  <div className="text-sm text-blue-200">Total Players</div>
                </div>
                <div className="p-4 text-center bg-green-600/20 rounded-xl">
                  <div className="mb-2 text-2xl">📈</div>
                  <div className="text-2xl font-bold text-green-400">{(leaderboard.reduce((sum, entry) => sum + (entry.total_score || entry.score), 0) / leaderboard.length).toFixed(2)}</div>
                  <div className="text-sm text-green-200">Avg XP</div>
                </div>
                <div className="p-4 text-center bg-red-600/20 rounded-xl">
                  <div className="mb-2 text-2xl">📉</div>
                  <div className="text-2xl font-bold text-red-400">{Math.min(...leaderboard.map(entry => entry.total_score || entry.score))}</div>
                  <div className="text-sm text-red-200">Lowest XP</div>
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
