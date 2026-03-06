import { motion } from 'framer-motion';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon = null,
  ...props 
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40',
    secondary: 'bg-gradient-to-r from-sky-400 to-cyan-500 hover:from-sky-500 hover:to-cyan-600 text-white shadow-lg shadow-sky-400/25 hover:shadow-sky-400/40',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25',
    outline: 'border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 active:bg-blue-100 bg-white/50 backdrop-blur-sm',
    ghost: 'text-slate-700 hover:bg-slate-100/80 active:bg-slate-200/80',
    glass: 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 shadow-lg',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
    lg: 'px-7 py-3.5 text-base gap-2.5 rounded-xl',
    xl: 'px-9 py-4 text-lg gap-3 rounded-2xl',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`
        inline-flex items-center justify-center
        font-semibold tracking-tight
        transition-all duration-300 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100
        relative overflow-hidden
        ${variants[variant] || variants.primary}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {/* Shine effect on hover */}
      {variant === 'primary' && (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
      )}
      
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <span className="relative z-10 flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          {children}
        </span>
      )}
    </motion.button>
  );
}
