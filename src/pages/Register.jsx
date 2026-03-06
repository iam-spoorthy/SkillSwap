import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, BookOpen, Target, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const SKILL_OPTIONS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Java',
  'C++', 'Django', 'SQL', 'Web Design', 'UI/UX',
  'Digital Marketing', 'Content Writing', 'Photography',
  'Video Editing', 'Graphic Design', 'Music Production',
  'English', 'Hindi', 'Spanish', 'French', 'Spoken English',
  'Drawing', 'Painting', 'Guitar', 'Piano', 'Chess'
];

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticating, error: authError } = useAuthStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    name: '', skillsOffered: [], skillsWanted: [],
  });
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStep1 = () => {
    const e = {};
    if (!formData.email) e.email = 'Email is required';
    else if (!validateEmail(formData.email)) e.email = 'Please enter a valid email';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'At least 6 characters';
    if (!formData.confirmPassword) e.confirmPassword = 'Please confirm password';
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!formData.name) e.name = 'Name is required';
    if (formData.skillsOffered.length === 0) e.skillsOffered = 'Select at least one skill to offer';
    if (formData.skillsWanted.length === 0) e.skillsWanted = 'Select at least one skill to learn';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleSkill = (skill, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(skill)
        ? prev[field].filter(s => s !== skill)
        : [...prev[field], skill],
    }));
  };

  const handleStep1Continue = (e) => {
    e.preventDefault();
    if (validateStep1()) { setStep(2); setErrors({}); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    const result = await register(formData);
    if (result.success) {
      toast.success('Account created! Welcome to SkillSwap 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 py-12">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-sky-50" />
      <div className="absolute inset-0 bg-dots opacity-[0.04]" />

      {/* Soft animated orbs */}
      <motion.div animate={{ y: [0, -30, 0], x: [0, 15, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute top-10 right-20 w-[380px] h-[380px] bg-sky-200/40 rounded-full blur-[120px]" />
      <motion.div animate={{ y: [0, 25, 0], x: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }} className="absolute bottom-10 left-20 w-[300px] h-[300px] bg-blue-200/40 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }} className="inline-flex">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mx-auto">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Join SkillSwap</h1>
            <p className="text-slate-500 text-sm">
              {step === 1 ? 'Create your account' : 'Tell us about your skills'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all" />
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-slate-200'}`} />
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1 */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleStep1Continue}
                className="space-y-5"
              >
                <Input label="Email Address" type="email" name="email" icon={Mail} placeholder="you@example.com" value={formData.email} onChange={handleChange} error={errors.email} required />
                <Input label="Password" type="password" name="password" icon={Lock} placeholder="At least 6 characters" value={formData.password} onChange={handleChange} error={errors.password} required />
                <Input label="Confirm Password" type="password" name="confirmPassword" icon={Lock} placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required />

                {authError && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
                    {authError}
                  </motion.div>
                )}

                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.form>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar"
              >
                <Input label="Full Name" type="text" name="name" icon={User} placeholder="Enter your name" value={formData.name} onChange={handleChange} error={errors.name} required />

                {/* Skills Offered */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    Skills You Can Teach
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    {SKILL_OPTIONS.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill, 'skillsOffered')}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                          formData.skillsOffered.includes(skill)
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  {errors.skillsOffered && <p className="mt-1 text-sm text-rose-500">{errors.skillsOffered}</p>}
                </div>

                {/* Skills Wanted */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Target className="h-4 w-4 text-cyan-500" />
                    Skills You Want to Learn
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    {SKILL_OPTIONS.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill, 'skillsWanted')}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                          formData.skillsWanted.includes(skill)
                            ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20 scale-105'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-300'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  {errors.skillsWanted && <p className="mt-1 text-sm text-rose-500">{errors.skillsWanted}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" size="lg" className="flex-1" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" variant="primary" size="lg" className="flex-1" loading={isAuthenticating}>
                    Create Account
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Sign In Link */}
          <p className="text-center text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
