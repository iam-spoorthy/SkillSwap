import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { 
  ArrowRight, Users, Zap, Bot, Shield, 
  Star, Trophy, Video, ChevronRight, Sparkles,
  CheckCircle, Play, Globe, Heart
} from 'lucide-react';
import Button from '../components/ui/Button';

// Animated counter hook
function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  
  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, started]);
  
  return { count, start: () => setStarted(true) };
}

// Floating orb component
function FloatingOrb({ className, delay = 0 }) {
  return (
    <motion.div
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
      className={`absolute rounded-full blur-3xl ${className}`}
    />
  );
}

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const users = useCountUp(500, 2000);
  const skills = useCountUp(50, 1800);

  const FEATURES = [
    {
      icon: Users,
      title: 'Peer-to-Peer Learning',
      desc: 'Connect directly with skilled mentors. No middlemen, no corporate courses.',
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50',
    },
    {
      icon: Video,
      title: 'HD Video Sessions',
      desc: 'WebRTC sessions optimized for all bandwidths. Crystal clear learning.',
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: Bot,
      title: 'AI Tutor Fallback',
      desc: 'No mentor available? AI tutor teaches you instantly. Free for 2 months!',
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Trophy,
      title: 'Leaderboard & Badges',
      desc: 'Earn badges, climb the leaderboard, and get rewarded for mentoring.',
      gradient: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
    },
    {
      icon: Star,
      title: 'Community Ratings',
      desc: 'Rate peers after each session. Build trust and reputation organically.',
      gradient: 'from-pink-500 to-rose-600',
      bg: 'bg-pink-50',
    },
    {
      icon: Shield,
      title: 'Affordable for All',
      desc: 'Everything is free. AI tutor is just ₹20/month after the trial.',
      gradient: 'from-cyan-500 to-blue-600',
      bg: 'bg-cyan-50',
    },
  ];

  const STEPS = [
    { num: '01', title: 'Search a Skill', desc: 'Type any skill and get matched with expert mentors instantly', gradient: 'from-violet-600 to-purple-600' },
    { num: '02', title: 'Swipe & Book', desc: 'Browse mentor profiles with a swipe-based UI. Book in one tap', gradient: 'from-pink-600 to-rose-600' },
    { num: '03', title: 'Learn & Grow', desc: 'Join a live video session, learn in real-time, climb the leaderboard', gradient: 'from-emerald-600 to-teal-600' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* ========== Navigation ========== */}
      <nav className="fixed top-0 w-full z-50">
        <div className="bg-white/70 backdrop-blur-2xl border-b border-slate-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5"
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-violet-600 to-pink-600 rounded-xl blur-lg opacity-20" />
              </div>
              <span className="text-xl font-bold text-gradient">SkillSwap</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-slate-600 hover:text-violet-700 font-semibold transition-colors animated-underline"
              >
                Sign In
              </button>
              <Button variant="primary" onClick={() => navigate('/register')}>
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* ========== Hero Section ========== */}
      <section ref={heroRef} className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Animated background orbs */}
        <FloatingOrb className="w-[500px] h-[500px] bg-violet-300/30 top-0 -left-20" delay={0} />
        <FloatingOrb className="w-[600px] h-[600px] bg-pink-300/20 -bottom-20 -right-20" delay={2} />
        <FloatingOrb className="w-[300px] h-[300px] bg-cyan-300/20 top-40 right-1/4" delay={4} />
        
        {/* Dot pattern */}
        <div className="absolute inset-0 bg-dots opacity-40" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-7xl mx-auto text-center relative z-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-50/80 backdrop-blur-sm border border-violet-200/50 rounded-full text-violet-700 text-sm font-bold mb-8"
          >
            <Zap className="h-4 w-4 text-violet-500" />
            Peer-to-peer learning, reimagined
            <span className="h-1.5 w-1.5 bg-violet-500 rounded-full animate-pulse" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl lg:text-8xl font-extrabold text-slate-900 mb-6 leading-[1.05] tracking-tight"
          >
            Swap Skills,
            <br />
            <span className="text-gradient">Grow Together</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Learn from real people who know the skill you want.
            No expensive courses. No inconsistent videos.
            Just <span className="text-slate-700 font-semibold">real knowledge exchange</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              variant="primary"
              size="xl"
              onClick={() => navigate('/register')}
              className="group"
            >
              Start Learning Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => navigate('/login')}
            >
              <Play className="h-4 w-4" />
              Watch How It Works
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            onViewportEnter={() => { users.start(); skills.start(); }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-xl mx-auto"
          >
            {[
              { value: `${users.count}+`, label: 'Active Learners', icon: Globe },
              { value: `${skills.count}+`, label: 'Skills Available', icon: Zap },
              { value: '₹20', label: '/mo AI Tutor', icon: Bot },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <stat.icon className="h-4 w-4 text-violet-500" />
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">{stat.value}</p>
                </div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ========== How It Works ========== */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 to-white" />
        <div className="absolute inset-0 bg-grid" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              How It Works
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
              Three steps to <span className="text-gradient">mastery</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">Start learning in under a minute</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                custom={i}
                className="group relative bg-white rounded-2xl p-8 shadow-soft hover:shadow-soft-lg transition-all duration-500 border border-slate-100 hover:border-violet-200"
              >
                {/* Step number */}
                <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${step.gradient} text-white font-extrabold text-lg mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {step.num}
                </div>
                {/* Connecting line on desktop */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-16 -right-4 w-8 h-0.5 bg-gradient-to-r from-slate-200 to-transparent z-10" />
                )}
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== Features ========== */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
              Everything you need to <span className="text-gradient">level up</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">Powerful tools for learners and mentors alike</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                custom={i}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className={`group p-7 rounded-2xl border border-slate-100 bg-white hover:bg-gradient-to-br hover:${feature.bg} transition-all duration-500 cursor-default hover:shadow-lg hover:border-transparent`}
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== Pricing ========== */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white" />
        <div className="absolute inset-0 bg-dots opacity-30" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Pricing
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
              Simple, <span className="text-gradient">transparent</span> pricing
            </h2>
            <p className="text-lg text-slate-500 mb-14">Learn for free. AI tutor at a pocket-friendly price.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free Plan */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-soft border-2 border-slate-100 hover:border-violet-200 transition-all duration-300 text-left"
            >
              <div className="inline-flex px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600 mb-4">FREE FOREVER</div>
              <p className="text-5xl font-extrabold text-slate-900 mb-1">₹0</p>
              <p className="text-slate-500 mb-6 text-sm">No credit card required</p>
              <ul className="space-y-3 text-slate-700 text-sm mb-8">
                {['Unlimited peer sessions', 'Skill discovery', 'Leaderboard access', 'AI Tutor (2 months free)', 'Email reminders'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              whileHover={{ y: -5 }}
              className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-xl shadow-violet-500/20 text-white text-left overflow-hidden"
            >
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
              
              <div className="relative z-10">
                <div className="inline-flex px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold mb-4">
                  BEST VALUE ✨
                </div>
                <p className="text-5xl font-extrabold mb-1">₹20</p>
                <p className="text-violet-200 mb-6 text-sm">/month after free trial</p>
                <ul className="space-y-3 text-violet-100 text-sm mb-8">
                  {['Everything in Free', 'Unlimited AI Tutor', 'Priority matching', 'Advanced analytics', 'Voice AI sessions'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <CheckCircle className="h-4 w-4 text-emerald-300 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="glass"
                  size="lg"
                  className="w-full bg-white/20 hover:bg-white/30 font-bold"
                  onClick={() => navigate('/register')}
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600" />
        <FloatingOrb className="w-[400px] h-[400px] bg-white/10 top-0 left-0" delay={0} />
        <FloatingOrb className="w-[300px] h-[300px] bg-white/10 bottom-0 right-0" delay={3} />
        
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            Ready to Start Swapping Skills?
          </h2>
          <p className="text-lg text-violet-100 mb-10 max-w-xl mx-auto">
            Join thousands of learners and mentors building knowledge together
          </p>
          <Button
            variant="glass"
            size="xl"
            onClick={() => navigate('/register')}
            className="bg-white/20 hover:bg-white/30 font-bold text-lg group"
          >
            Join SkillSwap Now
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </section>

      {/* ========== Footer ========== */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-white font-bold text-lg">SkillSwap</span>
          </div>
          <p className="text-sm flex items-center gap-1.5">
            © 2026 SkillSwap. Built with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> for learners everywhere.
          </p>
          <div className="flex gap-6 text-sm">
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <a key={link} href="#" className="hover:text-white transition-colors animated-underline">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
