import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Copy, Check, Home, Bot, Sparkles } from 'lucide-react';
import Vapi from '@vapi-ai/web';
import Button from '../components/ui/Button';
import { aiTutorAPI } from '../services/apiService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function AITutor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const skill = location.state?.skill || 'General Learning';
  const initialSessionId = location.state?.sessionId;
  const vapiPublicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;

  const [sessionId, setSessionId] = useState(initialSessionId);
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'assistant',
      content: `👋 Welcome! I'm your AI Tutor. I'm here to help you learn ${skill} step by step. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const messagesEndRef = useRef(null);
  const vapiRef = useRef(null);
  const partialByRoleRef = useRef({ user: '', assistant: '' });
  const flushTimersRef = useRef({ user: null, assistant: null });
  const lastCommittedRef = useRef({ user: '', assistant: '' });

  const addMessage = (role, content) => {
    if (!content || typeof content !== 'string' || !content.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        role,
        content: content.trim(),
        timestamp: new Date(),
      },
    ]);
  };

  const commitTranscript = (role, content) => {
    const normalized = content?.trim();
    if (!normalized) return;
    
    // Only commit if different from last committed message
    if (lastCommittedRef.current[role] === normalized) return;
    
    // Skip very short fragments (single words like "1," or "Example")
    if (normalized.split(' ').length < 2 && !normalized.match(/[.!?]$/)) {
      return;
    }
    
    lastCommittedRef.current[role] = normalized;
    addMessage(role, normalized);
    partialByRoleRef.current[role] = '';
  };

  // Start a new session if sessionId is not provided
  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    const initializeSession = async () => {
      if (!sessionId) {
        try {
          console.log('Initializing AI session for skill:', skill);
          const response = await aiTutorAPI.startSession(skill);
          console.log('Session created:', response.data._id);
          setSessionId(response.data._id);
        } catch (error) {
          console.error('Failed to start session:', error.response?.data || error.message);
          toast.error(error.response?.data?.message || 'Failed to start AI session');
          navigate('/dashboard');
        }
      }
    };
    initializeSession();
  }, [sessionId, skill, navigate, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!vapiPublicKey) {
      toast.error('Missing Vapi config: VITE_VAPI_PUBLIC_KEY');
      return;
    }

    const vapi = new Vapi(vapiPublicKey);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      setIsCallActive(true);
      setLoading(false);

      try {
        vapi.send({
          type: 'add-message',
          message: {
            role: 'system',
            content: `You are SkillSwap AI Tutor. Teach ${skill} only. Never act as clinic, receptionist, scheduler, or customer support. Ask learner goals, explain step-by-step, give examples, and keep answers concise.`,
          },
        });
      } catch (error) {
        console.error('Failed to inject tutor system message:', error);
      }

      toast.success('Vapi call started');
    });

    vapi.on('call-end', () => {
      setIsCallActive(false);
      setLoading(false);
      toast('Vapi call ended');
    });

    vapi.on('message', (message) => {
      if (!message || typeof message !== 'object') return;

      if (message.type === 'transcript') {
        const role = message.role === 'assistant' ? 'assistant' : message.role === 'user' ? 'user' : null;
        if (!role) return;

        const transcript = typeof message.transcript === 'string' ? message.transcript.trim() : '';
        if (!transcript) return;

        // Check for final transcript indicators
        const isFinal =
          message.transcriptType === 'final' ||
          message.isFinal === true ||
          message.final === true ||
          message.status === 'final';

        if (isFinal) {
          // Clear any pending partial timeout
          if (flushTimersRef.current[role]) {
            clearTimeout(flushTimersRef.current[role]);
            flushTimersRef.current[role] = null;
          }
          // Commit final transcript immediately
          commitTranscript(role, transcript);
          partialByRoleRef.current[role] = '';
          return;
        }

        // For partial transcripts: update buffer and reset timeout
        partialByRoleRef.current[role] = transcript;

        // Clear existing timeout
        if (flushTimersRef.current[role]) {
          clearTimeout(flushTimersRef.current[role]);
        }

        // Auto-commit partial after 2.5 seconds of no updates (full sentence time)
        flushTimersRef.current[role] = setTimeout(() => {
          const buffered = partialByRoleRef.current[role];
          if (buffered && buffered.trim()) {
            commitTranscript(role, buffered);
          }
          flushTimersRef.current[role] = null;
        }, 2500);
      }
    });

    vapi.on('error', (error) => {
      console.error('Vapi error:', error);
      console.error('Vapi error details:', error?.error || error?.message || error);
      setLoading(false);
      setIsCallActive(false);
      const details = error?.error?.message || error?.error || error?.message;
      toast.error(details ? `Vapi error: ${details}` : 'Vapi call failed');
    });

    return () => {
      try {
        if (flushTimersRef.current.user) clearTimeout(flushTimersRef.current.user);
        if (flushTimersRef.current.assistant) clearTimeout(flushTimersRef.current.assistant);
        vapi.stop();
      } catch (error) {
        console.error('Error stopping Vapi on cleanup:', error);
      }
      vapiRef.current = null;
    };
  }, [vapiPublicKey, skill]);

  const handleStartCall = async () => {
    if (!sessionId) {
      toast.error('Session not initialized. Please wait...');
      return;
    }

    if (!vapiRef.current) {
      toast.error('Vapi is not initialized');
      return;
    }

    try {
      setLoading(true);
      const tutorAssistant = {
        model: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are SkillSwap AI Tutor - expert at teaching ${skill}. Your role:
1. Ask learner's current level and learning goals
2. Explain concepts step-by-step with practical examples
3. Provide real-world use cases and applications
4. Give notes/summaries at the end of explanations
5. Answer questions and guide practice
6. Be encouraging, patient, and clear

IMPORTANT: Teach ONLY ${skill}. Never act as clinic staff, receptionist, scheduler, or support agent. If asked about unrelated healthcare or booking topics, politely redirect to ${skill}.`,
            },
          ],
          temperature: 0.7,
          maxTokens: 500,
        },
        voice: {
          provider: '11labs',
          voiceId: 'sarah',
        },
        firstMessage: `Hi! I'm your ${skill} tutor. What's your current experience level with ${skill}, and what would you like to learn today?`,
        firstMessageMode: 'assistant-speaks-first',
      };

      await vapiRef.current.start(tutorAssistant);
    } catch (error) {
      console.error('Error starting Vapi call:', error);
      console.error('Start call error details:', error?.error || error?.message || error);
      setLoading(false);
      const details = error?.error?.message || error?.error || error?.message;
      toast.error(details ? `Failed to start Vapi call: ${details}` : 'Failed to start Vapi call');
    }
  };

  const handleStopCall = async () => {
    if (!vapiRef.current) return;
    try {
      await vapiRef.current.stop();
    } catch (error) {
      console.error('Error stopping Vapi call:', error);
      toast.error('Failed to stop Vapi call');
    }
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/20">
        <div className="absolute inset-0 bg-grid opacity-[0.05]" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">AI Tutor <Sparkles className="h-4 w-4 text-amber-300" /></h1>
              <p className="text-violet-200 text-sm">Learning {skill}</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-violet-200">Free Plan</p>
              <p className="text-sm font-semibold">10 min/day remaining</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
              title="Back to Dashboard"
            >
              <Home className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-4">
        <AnimatePresence>
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-md lg:max-w-2xl px-5 py-3.5 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-br-md shadow-md shadow-violet-600/20'
                  : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-md'
              }`}>
                <p className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>

                {message.role === 'assistant' && (
                  <div className="mt-3 flex gap-3 pt-2 border-t border-slate-100">
                    <button onClick={() => copyMessage(message.content)} className="text-xs text-slate-400 hover:text-violet-600 flex items-center gap-1 transition-colors">
                      {copied ? <><Check className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                    </button>
                    <button className="text-xs text-slate-400 hover:text-violet-600 flex items-center gap-1 transition-colors">
                      <Volume2 className="h-3.5 w-3.5" /> Speak
                    </button>
                  </div>
                )}

                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-violet-200' : 'text-slate-400'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white text-slate-600 px-5 py-3.5 rounded-2xl rounded-bl-md flex gap-2 items-center shadow-sm border border-slate-100">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm ml-1">AI is thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Button
              onClick={isCallActive ? handleStopCall : handleStartCall}
              disabled={loading || !sessionId}
              className={`w-full flex items-center justify-center gap-2 ${
                isCallActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
              }`}
            >
              {isCallActive ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {loading ? 'Connecting...' : isCallActive ? 'End Vapi Call' : 'Start Vapi Call'}
            </Button>
          </div>

          {/* Suggestions */}
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vapi Voice Tips</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                `Say: Explain basics of ${skill}`,
                'Say: Give me a practical example',
                'Say: What are common mistakes?',
              ].map((tip, i) => (
                <div
                  key={i}
                  className="text-xs px-3 py-2.5 bg-violet-50 text-violet-600 rounded-xl font-medium"
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Trial Info */}
          <div className="mt-4 p-3.5 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-xl">
            <p className="text-xs text-violet-800">
              💡 <strong>Free Trial:</strong> You have <strong>10 minutes/day</strong> remaining.
              Upgrade to Premium (₹20/month) for unlimited access!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
