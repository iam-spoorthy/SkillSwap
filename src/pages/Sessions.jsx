import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, Star, Filter } from 'lucide-react';
import { sessionAPI } from '../services/apiService';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';
import { getAvatar } from '../utils/avatar';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function Sessions() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadSessions(); }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const response = await sessionAPI.getMySessions();
      setSessions(response.data);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally { setLoading(false); }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return session.status === 'scheduled';
    if (filter === 'completed') return session.status === 'completed';
    if (filter === 'cancelled') return session.status === 'cancelled';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-sky-100 text-sky-700';
      case 'active':    return 'bg-emerald-100 text-emerald-700';
      case 'completed': return 'bg-slate-100 text-slate-600';
      case 'cancelled': return 'bg-rose-100 text-rose-700';
      default:          return 'bg-slate-100 text-slate-600';
    }
  };

  const canJoinSession = (session) => {
    if (session.status !== 'scheduled') return false;
    const scheduledTime = new Date(session.scheduledAt).getTime();
    const now = Date.now();
    return now >= scheduledTime - 5 * 60 * 1000 && now <= scheduledTime + 30 * 60 * 1000;
  };

  const getOtherPerson = (session) => {
    return session.mentor?._id === user._id ? session.learner : session.mentor;
  };

  const statCards = [
    { label: 'Total', value: sessions.length, color: 'violet' },
    { label: 'Upcoming', value: sessions.filter(s => s.status === 'scheduled').length, color: 'sky' },
    { label: 'Completed', value: sessions.filter(s => s.status === 'completed').length, color: 'emerald' },
    { label: 'Cancelled', value: sessions.filter(s => s.status === 'cancelled').length, color: 'rose' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statCards.map(card => (
            <motion.div key={card.label} variants={fadeUp} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
              <p className={`text-3xl font-bold text-${card.color}-600`}>{card.value}</p>
              <p className="text-sm text-slate-500 mt-1">{card.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filter Buttons */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-2 mb-6 flex-wrap">
          {['all', 'upcoming', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                filter === f
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Sessions List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="relative h-12 w-12 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-violet-200 animate-ping opacity-30" />
              <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-slate-500">Loading sessions...</p>
          </div>
        ) : filteredSessions.length > 0 ? (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            {filteredSessions.map(session => {
              const otherPerson = getOtherPerson(session);
              const joinable = canJoinSession(session);
              const isUpcoming = session.status === 'scheduled';
              const isMentor = session.mentor?._id === user._id;

              return (
                <motion.div
                  key={session._id}
                  variants={fadeUp}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={getAvatar(otherPerson?.avatar, otherPerson?.name, 48)}
                      alt={otherPerson?.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {session.skill}
                        <span className="ml-2 text-xs text-slate-400 font-normal">with {otherPerson?.name}</span>
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(session.scheduledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(session.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-sm text-slate-500">{session.duration} min</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                        <span className="text-xs text-slate-400">{isMentor ? '🎓 Teaching' : '📚 Learning'}</span>
                        {session.type === 'ai' && <span className="text-xs text-violet-600 font-semibold">🤖 AI</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    {joinable && (
                      <Button variant="primary" size="sm" className="flex-1 sm:flex-initial" onClick={() => navigate(`/room/${session._id}`)}>
                        <Video className="h-4 w-4 mr-2" /> Join
                      </Button>
                    )}
                    {isUpcoming && !joinable && (
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-initial" onClick={async () => {
                        try { await sessionAPI.updateSessionStatus(session._id, 'cancelled'); toast.success('Session cancelled'); loadSessions(); }
                        catch { toast.error('Failed to cancel'); }
                      }}>Cancel</Button>
                    )}
                    {session.status === 'completed' && (
                      <Button variant="ghost" size="sm" className="flex-1 sm:flex-initial" onClick={() => navigate(`/mentor/${otherPerson?._id}`)}>
                        <Star className="h-4 w-4 mr-1" /> View Profile
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white rounded-3xl border border-slate-100">
            <div className="h-16 w-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-violet-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Sessions Found</h3>
            <p className="text-slate-400 mb-6">
              {filter === 'all' ? "You haven't booked any sessions yet" : `No ${filter} sessions`}
            </p>
            <Button onClick={() => navigate('/dashboard')}>Find a Mentor</Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
