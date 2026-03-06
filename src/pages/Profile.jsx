import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, MapPin, BookOpen, Target, Clock,
  Save, ArrowLeft, Crown, Sparkles, Edit3, X
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import { getAvatar } from '../utils/avatar';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SKILL_OPTIONS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Java',
  'C++', 'Django', 'SQL', 'Web Design', 'UI/UX',
  'Digital Marketing', 'Content Writing', 'Photography',
  'Video Editing', 'Graphic Design', 'Music Production',
  'English', 'Hindi', 'Spanish', 'French', 'Spoken English',
  'Drawing', 'Painting', 'Guitar', 'Piano', 'Chess'
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || [],
    availability: user?.availability || [],
    location: user?.location || { state: '', district: '', pincode: '' },
  });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, location: { ...prev.location, [name]: value } }));
  };

  const toggleSkill = (skill, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(skill)
        ? prev[field].filter(s => s !== skill)
        : [...prev[field], skill],
    }));
  };

  const addAvailabilitySlot = () => {
    setFormData(prev => ({
      ...prev,
      availability: [...prev.availability, { day: 'Mon', startTime: '09:00', endTime: '17:00' }],
    }));
  };

  const removeAvailabilitySlot = (index) => {
    setFormData(prev => ({ ...prev, availability: prev.availability.filter((_, i) => i !== index) }));
  };

  const updateAvailabilitySlot = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map((slot, i) => i === index ? { ...slot, [field]: value } : slot),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) { toast.success('Profile updated!'); setEditing(false); }
      else toast.error(result.error);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally { setSaving(false); }
  };

  const avgRating = user?.totalRatings > 0
    ? (user.ratingSum / user.totalRatings).toFixed(1) : '—';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <div className="space-y-6">
            {/* Avatar Card */}
            <motion.div variants={fadeUp} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center space-y-4">
              <div className="relative inline-block">
                <img
                  src={getAvatar(user?.avatar, user?.name, 100)}
                  alt={user?.name}
                  className="h-24 w-24 rounded-full mx-auto object-cover ring-4 ring-violet-100 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-400 border-2 border-white rounded-full" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>

              {user?.isPremium ? (
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full font-semibold text-sm shadow-md shadow-amber-200">
                  <Crown className="h-4 w-4" />
                  Premium Member
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium text-center">
                    Free Plan
                  </div>
                  <button
                    onClick={() => toast('Premium upgrade coming soon! 🚀', { icon: '👑' })}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Crown className="h-4 w-4" />
                    Upgrade to Premium — ₹20/mo
                  </button>
                </div>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" /> Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Badge Score', value: user?.badgeScore || 0, color: 'violet' },
                  { label: 'Sessions', value: user?.totalSessions || 0, color: 'emerald' },
                  { label: 'Avg Rating', value: avgRating, color: 'amber' },
                  { label: 'Ratings', value: user?.totalRatings || 0, color: 'pink' },
                ].map(stat => (
                  <div key={stat.label} className={`bg-${stat.color}-50 rounded-2xl p-3 text-center`}>
                    <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Editable Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Toggle */}
            <motion.div variants={fadeUp} className="flex justify-end">
              {!editing ? (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button variant="primary" onClick={handleSave} loading={saving}>
                    <Save className="h-4 w-4 mr-2" /> Save
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Basic Info */}
            <motion.div variants={fadeUp} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Basic Info</h3>
              <Input label="Full Name" name="name" icon={User} value={formData.name} onChange={handleChange} disabled={!editing} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                <textarea
                  name="bio" value={formData.bio} onChange={handleChange} disabled={!editing}
                  placeholder="Tell others about yourself..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none disabled:bg-slate-50 disabled:cursor-not-allowed resize-none h-20 text-sm transition-all"
                  maxLength={300}
                />
                <p className="text-xs text-slate-400 text-right mt-1">{formData.bio.length}/300</p>
              </div>

              {/* Location */}
              <div className="grid grid-cols-3 gap-3">
                {['state', 'district', 'pincode'].map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">{field}</label>
                    <input
                      name={field}
                      value={formData.location[field]}
                      onChange={handleLocationChange}
                      disabled={!editing}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none disabled:bg-slate-50 disabled:cursor-not-allowed text-sm transition-all"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div variants={fadeUp} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-5">
              <h3 className="text-lg font-bold text-slate-900">Skills</h3>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <BookOpen className="h-4 w-4 text-violet-500" />
                  Skills I Can Teach
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map(skill => (
                    <button
                      key={skill} type="button"
                      onClick={() => editing && toggleSkill(skill, 'skillsOffered')}
                      disabled={!editing}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                        formData.skillsOffered.includes(skill)
                          ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
                          : editing ? 'bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-violet-600'
                          : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Target className="h-4 w-4 text-pink-500" />
                  Skills I Want to Learn
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map(skill => (
                    <button
                      key={skill} type="button"
                      onClick={() => editing && toggleSkill(skill, 'skillsWanted')}
                      disabled={!editing}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                        formData.skillsWanted.includes(skill)
                          ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                          : editing ? 'bg-slate-100 text-slate-600 hover:bg-pink-100 hover:text-pink-600'
                          : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Availability */}
            <motion.div variants={fadeUp} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-violet-500" />
                  Availability
                </h3>
                {editing && (
                  <Button variant="outline" size="sm" onClick={addAvailabilitySlot}>+ Add Slot</Button>
                )}
              </div>

              {formData.availability.length === 0 ? (
                <p className="text-slate-400 text-sm">No availability set</p>
              ) : (
                <div className="space-y-3">
                  {formData.availability.map((slot, index) => (
                    <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                      <select
                        value={slot.day}
                        onChange={(e) => updateAvailabilitySlot(index, 'day', e.target.value)}
                        disabled={!editing}
                        className="px-3 py-2 border border-slate-200 rounded-xl text-sm disabled:bg-slate-100 focus:border-violet-500 focus:outline-none"
                      >
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <input type="time" value={slot.startTime} onChange={(e) => updateAvailabilitySlot(index, 'startTime', e.target.value)} disabled={!editing} className="px-3 py-2 border border-slate-200 rounded-xl text-sm disabled:bg-slate-100 focus:border-violet-500 focus:outline-none" />
                      <span className="text-slate-400">to</span>
                      <input type="time" value={slot.endTime} onChange={(e) => updateAvailabilitySlot(index, 'endTime', e.target.value)} disabled={!editing} className="px-3 py-2 border border-slate-200 rounded-xl text-sm disabled:bg-slate-100 focus:border-violet-500 focus:outline-none" />
                      {editing && (
                        <button onClick={() => removeAvailabilitySlot(index)} className="text-rose-400 hover:text-rose-600 font-bold transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
