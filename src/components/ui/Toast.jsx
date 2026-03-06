import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'from-emerald-500 to-green-600',
  error: 'from-rose-500 to-red-600',
  warning: 'from-amber-500 to-orange-600',
  info: 'from-blue-500 to-indigo-600',
};

const bgColors = {
  success: 'bg-emerald-50 border-emerald-200',
  error: 'bg-rose-50 border-rose-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-blue-50 border-blue-200',
};

export default function Toast({ 
  message, 
  type = 'info', 
  isVisible = true, 
  onClose 
}) {
  const IconComponent = icons[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-xl
            ${bgColors[type]}
          `}
        >
          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${colors[type]}`}>
            <IconComponent className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-medium text-slate-800 flex-1">{message}</p>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
