import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Flame, User } from 'lucide-react';
import { leaderboardAPI } from '../services/apiService';
import { useAuthStore } from '../store/authStore';
import { getAvatar } from '../utils/avatar';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [topMentors, setTopMentors] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadLeaderboard(); }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const mentorsResponse = await leaderboardAPI.getTopMentors(50);
      setTopMentors(mentorsResponse.data);
      if (user?._id) {
        const rankResponse = await leaderboardAPI.getUserRank(user._id);
        setUserRank(rankResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load leaderboard');
      console.error(error);
    } finally { setLoading(false); }
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Leaderboard Table */}
          <div className="lg:col-span-2 space-y-6">
            <motion.section variants={fadeUp}>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">🏆 Top Mentors</h2>
              <div className="flex gap-2 mb-6">
                {['all', 'week', 'month'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                      filter === f
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-600'
                    }`}
                  >
                    {f === 'all' ? 'All Time' : f === 'week' ? 'This Week' : 'This Month'}
                  </button>
                ))}
              </div>
            </motion.section>

            {loading ? (
              <div className="text-center py-16">
                <div className="relative h-12 w-12 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-violet-200 animate-ping opacity-30" />
                  <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
                </div>
                <p className="text-slate-500">Loading leaderboard...</p>
              </div>
            ) : topMentors.length > 0 ? (
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
                {topMentors.map((mentor, index) => {
                  const avgRating = mentor.totalRatings > 0
                    ? (mentor.ratingSum / mentor.totalRatings).toFixed(1) : 0;
                  const isCurrentUser = user?._id === mentor._id;
                  const isTop3 = index < 3;

                  return (
                    <motion.div
                      key={mentor._id}
                      variants={fadeUp}
                      whileHover={{ y: -2, scale: 1.01 }}
                      className={`p-4 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-violet-100 to-pink-100 border-2 border-violet-400 shadow-md shadow-violet-200/50'
                          : isTop3
                          ? 'bg-white border border-slate-100 shadow-sm hover:shadow-lg'
                          : 'bg-white border border-slate-100 hover:shadow-md'
                      }`}
                      onClick={() => navigate(`/mentor/${mentor._id}`)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`text-2xl font-bold w-10 text-center ${isTop3 ? '' : 'text-slate-400'}`}>
                          {getMedalEmoji(index + 1)}
                        </div>
                        <img src={getAvatar(mentor.avatar, mentor.name, 48)} alt={mentor.name}
                          className={`h-12 w-12 rounded-full object-cover ${isTop3 ? 'ring-2 ring-violet-200' : 'ring-1 ring-slate-100'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {mentor.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full">YOU</span>
                            )}
                          </p>
                          <p className="text-sm text-slate-500">{mentor.totalSessions} sessions • {mentor.totalRatings} ratings</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-xs text-slate-400">Rating</p>
                          <span className="text-lg font-bold text-slate-900">⭐ {avgRating}</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Badge</p>
                          <div className="flex items-center gap-1">
                            <Flame className="h-5 w-5 text-orange-500 fill-orange-500" />
                            <span className="text-lg font-bold text-slate-900">{mentor.badgeScore}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
                <p className="text-slate-500">No mentors in leaderboard yet</p>
              </div>
            )}
          </div>

          {/* Right - Your Stats */}
          <aside className="space-y-6">
            {userRank && (
              <motion.div variants={fadeUp} className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-3xl p-6 text-white space-y-4 shadow-xl shadow-violet-600/20">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <h3 className="text-lg font-bold relative z-10">Your Rank</h3>
                <div className="text-center py-6 relative z-10">
                  <div className="text-6xl font-bold mb-2">
                    {userRank.rank <= 3 ? getMedalEmoji(userRank.rank) : `#${userRank.rank}`}
                  </div>
                  <p className="text-2xl font-bold">{userRank.rank}</p>
                  <p className="text-violet-200 text-sm mt-2">out of {userRank.totalUsers} users</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20 relative z-10">
                  {[
                    { label: 'Badge Score', value: userRank.badgeScore },
                    { label: 'Sessions', value: userRank.totalSessions },
                    { label: 'Rating', value: userRank.totalRatings > 0 ? (userRank.ratingSum / userRank.totalRatings).toFixed(1) : '—' },
                    { label: 'Ratings', value: userRank.totalRatings },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                      <p className="text-xs text-violet-200 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Achievements */}
            <motion.div variants={fadeUp} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Achievements</h3>
              {[
                { emoji: '⭐', title: 'Rising Star', condition: user?.badgeScore >= 50, text: 'Badge: 50+', bg: 'amber' },
                { emoji: '🎓', title: 'Mentor Master', condition: user?.totalSessions >= 10, text: 'Sessions: 10+', bg: 'sky' },
                { emoji: '💎', title: 'Highly Rated', condition: user?.totalRatings >= 5, text: 'Ratings: 5+', bg: 'emerald' },
              ].map(a => (
                <div key={a.title} className={`flex items-center gap-3 p-3 bg-${a.bg}-50 rounded-xl border border-${a.bg}-100`}>
                  <span className="text-3xl">{a.emoji}</span>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.condition ? '✅ Unlocked' : a.text}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Tip Card */}
            <motion.div variants={fadeUp} className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-3xl p-6 border border-violet-100">
              <h4 className="font-bold text-slate-900 mb-3">💡 Tip</h4>
              <p className="text-sm text-slate-600">
                Complete sessions and get rated by learners to increase your badge score and climb the leaderboard!
              </p>
            </motion.div>
          </aside>
        </motion.div>
      </main>
    </div>
  );
}
