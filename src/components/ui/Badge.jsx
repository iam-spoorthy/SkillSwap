import { motion } from 'framer-motion';

const colorMap = {
  violet: 'bg-violet-100 text-violet-700 border-violet-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  yellow: 'bg-amber-100 text-amber-700 border-amber-200',
  red: 'bg-rose-100 text-rose-700 border-rose-200',
  gray: 'bg-slate-100 text-slate-700 border-slate-200',
  gradient: 'bg-gradient-to-r from-violet-500 to-pink-500 text-white border-transparent',
};

const sizeMap = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3.5 py-1.5 text-sm',
};

export default function Badge({
  children,
  color = 'violet',
  size = 'md',
  icon: Icon = null,
  pulse = false,
  className = '',
}) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-1 font-bold rounded-full border
        ${colorMap[color] || colorMap.violet}
        ${sizeMap[size]}
        ${className}
      `}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </motion.span>
  );
}
