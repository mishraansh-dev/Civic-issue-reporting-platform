import { motion } from 'framer-motion'
import AnimatedCounter from './AnimatedCounter'
import { cn } from '../utils/helpers'

const accentMap = {
  default: { border: 'border-l-slate-600',   icon: 'bg-slate-800 text-slate-400' },
  amber:   { border: 'border-l-amber-500',   icon: 'bg-amber-500/10 text-amber-400' },
  blue:    { border: 'border-l-blue-500',    icon: 'bg-blue-500/10 text-blue-400' },
  emerald: { border: 'border-l-emerald-500', icon: 'bg-emerald-500/10 text-emerald-400' },
  indigo:  { border: 'border-l-indigo-500',  icon: 'bg-indigo-500/10 text-indigo-400' },
}

export default function StatsCard({ label, value, icon: Icon, accent = 'default', index = 0 }) {
  const colors = accentMap[accent] ?? accentMap.default

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className={cn('stats-card border-l-2', colors.border)}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            {label}
          </p>
          <p className="text-3xl font-bold text-slate-100 tabular-nums">
            <AnimatedCounter value={value ?? 0} />
          </p>
        </div>
        {Icon && (
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', colors.icon)}>
            <Icon size={17} strokeWidth={2} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
