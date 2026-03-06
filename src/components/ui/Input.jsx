import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Input({
  label = '',
  type = 'text',
  placeholder = '',
  error = '',
  icon: Icon = null,
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 transition-colors duration-200 ${
            isFocused ? 'text-violet-500' : error ? 'text-rose-400' : 'text-slate-400'
          }`} />
        )}
        
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3 rounded-xl border-2 bg-white/80 backdrop-blur-sm
            transition-all duration-300 ease-out
            focus:outline-none focus:ring-4
            disabled:bg-slate-50/80 disabled:cursor-not-allowed disabled:text-slate-400
            placeholder:text-slate-400 text-slate-900 font-medium text-sm
            ${Icon ? 'pl-11' : ''}
            ${error 
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 bg-rose-50/50' 
              : 'border-slate-200 focus:border-violet-500 focus:ring-violet-100/50 hover:border-slate-300'}
            ${className}
          `}
          {...props}
        />

        {/* Glow effect on focus */}
        {isFocused && !error && (
          <div className="absolute inset-0 rounded-xl bg-violet-500/5 pointer-events-none" />
        )}

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="mt-1.5 text-sm text-rose-600 flex items-center gap-1"
          >
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
