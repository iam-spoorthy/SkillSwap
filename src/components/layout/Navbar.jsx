import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, Trophy, Bot, User, 
  LogOut, Menu, X, ChevronDown, Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getAvatar } from '../../utils/avatar';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Sessions', path: '/sessions', icon: Calendar },
  { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { label: 'AI Tutor', path: '/ai-session', icon: Bot },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50">
      {/* Gradient line accent at top */}
      <div className="h-[2px] bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600" />
      
      <div className="bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 group"
            >
              <div className="relative">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
              </div>
              <span className="text-xl font-bold text-gradient hidden sm:block">
                SkillSwap
              </span>
            </motion.button>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100/60 rounded-xl p-1">
              {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
                <motion.button
                  key={path}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(path)}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300
                    ${isActive(path)
                      ? 'text-blue-700'
                      : 'text-slate-500 hover:text-slate-700'
                    }
                  `}
                >
                  {isActive(path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm shadow-slate-200/50"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Badge score pill */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-full text-sm cursor-default"
              >
                <span className="text-amber-500">⭐</span>
                <span className="font-bold text-amber-700">{user?.badgeScore || 0}</span>
              </motion.div>

              {/* Profile Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100/80 transition-all duration-200"
                >
                  <div className="relative">
                    <img
                      src={getAvatar(user?.avatar, user?.name, 32)}
                      alt={user?.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-200 ring-offset-2 ring-offset-white"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-slate-700 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 py-2 z-20 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-sky-50/50 to-blue-50/50">
                          <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 transition-colors font-medium"
                          >
                            <User className="h-4 w-4 text-blue-500" /> My Profile
                          </button>
                          <button
                            onClick={() => { setProfileOpen(false); navigate('/sessions'); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 transition-colors font-medium"
                          >
                            <Calendar className="h-4 w-4 text-blue-500" /> My Sessions
                          </button>
                        </div>
                        <div className="border-t border-slate-100 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                          >
                            <LogOut className="h-4 w-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-b border-slate-200/50 bg-white/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map(({ label, path, icon: Icon }, i) => (
                <motion.button
                  key={path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { navigate(path); setMobileOpen(false); }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                    ${isActive(path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" /> {label}
                </motion.button>
              ))}
              <div className="border-t border-slate-100 pt-2 mt-2">
                <button
                  onClick={() => { navigate('/profile'); setMobileOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <User className="h-5 w-5" /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-5 w-5" /> Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
