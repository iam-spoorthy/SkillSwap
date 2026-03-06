import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { mentorAPI, sessionAPI, aiTutorAPI } from '../services/apiService';
import { Search, Bot, Calendar, Settings, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Navbar from '../components/layout/Navbar';
import { getAvatar } from '../utils/avatar';
import SwipeDeck from '../components/mentor/SwipeDeck';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [searchSkill, setSearchSkill] = useState('');
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMentorSearch, setShowMentorSearch] = useState(false);
  const [mySessions, setMySessions] = useState([]);

  useEffect(() => { loadMySessions(); }, []);

  const loadMySessions = async () => {
    try {
      const response = await sessionAPI.getMySessions();
      setMySessions(response.data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleSearchMentors = async (e) => {
    if (e) e.preventDefault();
    const skill = searchSkill.trim();
    if (!skill) { toast.error('Please enter a skill to search'); return; }
    setLoading(true);
    try {
      const response = await mentorAPI.searchMentors(skill);
      setMentors(response.data);
      setShowMentorSearch(true);
      if (response.data.length === 0) toast('No mentors found. Try AI Tutor!');
      else toast.success(`Found ${response.data.length} mentors! 🎉`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Search failed');
    } finally { setLoading(false); }
  };

  const handleQuickSearch = (skill) => {
    setSearchSkill(skill);
    // We need to search immediately with the skill value (not relying on state)
    const doSearch = async () => {
      setLoading(true);
      try {
        const response = await mentorAPI.searchMentors(skill);
        setMentors(response.data);
        setShowMentorSearch(true);
        if (response.data.length === 0) toast('No mentors found. Try AI Tutor!');
        else toast.success(`Found ${response.data.length} mentors! 🎉`);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Search failed');
      } finally { setLoading(false); }
    };
    doSearch();
  };

  const handleBookMentor = (mentor) => navigate('/book-session', { state: { mentor, skill: searchSkill } });
  const handleViewProfile = (mentor) => navigate(`/mentor/${mentor._id}`, { state: { mentor } });

  const handleAITutor = async () => {
    if (!searchSkill.trim()) { toast.error('Enter a skill for AI tutor'); return; }
    try {
      const response = await aiTutorAPI.startSession(searchSkill);
      navigate('/ai-session', { state: { sessionId: response.data._id, skill: searchSkill } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start AI session');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Hero */}
            <motion.section variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 p-8 text-white">
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                  <span className="text-sm font-medium text-violet-200">Welcome back</span>
                </div>
                <h2 className="text-3xl font-extrabold mb-2">
                  {user?.name}! 👋
                </h2>
                <p className="text-violet-200 mb-6">
                  Find skilled mentors and swap knowledge with your community
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearchMentors} className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search for a skill (e.g., JavaScript, Spanish, Guitar)..."
                      value={searchSkill}
                      onChange={(e) => setSearchSkill(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/95 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                    className="px-5 py-3.5 bg-white text-violet-600 rounded-2xl font-bold shadow-lg hover:bg-white/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? '...' : <Search className="h-5 w-5" />}
                  </motion.button>
                </form>

                {/* Quick pills */}
                <div className="mt-5 flex gap-2 flex-wrap">
                  {['JavaScript', 'Python', 'Spanish', 'Guitar'].map(skill => (
                    <button
                      key={skill}
                      onClick={() => handleQuickSearch(skill)}
                      className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full text-white text-sm font-medium transition-all border border-white/10"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Mentor Discovery */}
            <motion.section variants={fadeUp}>
              {showMentorSearch ? (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-slate-900">Mentors for {searchSkill}</h3>
                  <SwipeDeck mentors={mentors} onBook={handleBookMentor} onViewProfile={handleViewProfile} loading={loading} />
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 shadow-sm">
                  <div className="h-16 w-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-violet-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Start Your Learning Journey</h3>
                  <p className="text-slate-500 mb-6">Search for a skill above to discover amazing mentors</p>
                  <Button variant="outline" onClick={() => handleQuickSearch('JavaScript')}>Try Example Search</Button>
                </div>
              )}
            </motion.section>
          </div>

          {/* Right Column */}
          <aside className="space-y-6">
            {/* AI Tutor Card */}
            <motion.div variants={fadeUp} className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-700 to-fuchsia-700 rounded-3xl p-6 text-white shadow-xl shadow-violet-600/20">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Bot className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">AI Tutor</h3>
                </div>
                <p className="text-sm text-purple-200">
                  Learn from our AI tutor powered by Vapi. First 2 months free! 🤖
                </p>
                <Button variant="glass" className="w-full !bg-white/20 hover:!bg-white/30" onClick={handleAITutor} disabled={!searchSkill.trim()}>
                  Start AI Session
                </Button>
              </div>
            </motion.div>

            {/* Upcoming Sessions */}
            <motion.div variants={fadeUp} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-violet-500" />
                <h3 className="text-lg font-bold text-slate-900">Upcoming Sessions</h3>
              </div>

              {mySessions.length > 0 ? (
                <div className="space-y-3">
                  {mySessions.slice(0, 3).map(session => (
                    <div key={session._id} className="p-3 bg-slate-50 rounded-xl border-l-4 border-violet-500">
                      <p className="font-semibold text-slate-900 text-sm">{session.skill}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(session.scheduledAt).toLocaleDateString('en-IN', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No sessions yet. Book one!</p>
              )}

              <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => navigate('/sessions')}>
                View All Sessions
              </Button>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={fadeUp} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-1">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Quick Links</h3>
              {[
                { label: '🏆 Leaderboard', path: '/leaderboard' },
                { label: '👤 My Profile', path: '/profile' },
              ].map(link => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="w-full px-4 py-2.5 text-left rounded-xl hover:bg-violet-50 transition-colors text-slate-700 font-medium text-sm flex items-center justify-between group"
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-violet-500 transition-colors" />
                </button>
              ))}
            </motion.div>
          </aside>
        </motion.div>
      </main>
    </div>
  );
}
