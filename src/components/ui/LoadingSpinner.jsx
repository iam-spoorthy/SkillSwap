import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md', text = '', className = '' }) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className={`${sizes[size]} rounded-full border-2 border-slate-200`}
          style={{ borderTopColor: '#7c3aed', borderRightColor: '#ec4899' }}
        />
        {/* Inner glow */}
        <div className={`absolute inset-2 rounded-full bg-gradient-to-br from-violet-400/20 to-pink-400/20 blur-sm`} />
        {/* Center dot */}
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600" />
        </motion.div>
      </div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-slate-500"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
