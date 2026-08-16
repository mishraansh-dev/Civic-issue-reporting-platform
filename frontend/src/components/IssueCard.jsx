import { motion } from 'framer-motion'
import { MapPin, Clock } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { CATEGORY_INFO, formatRelativeTime } from '../utils/helpers'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function IssueCard({ issue, action, index = 0 }) {
  const cat = CATEGORY_INFO[issue.category] ?? CATEGORY_INFO.Other
  const imageUrl = issue.imageUrl ? `${API_URL}${issue.imageUrl}` : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="issue-card flex flex-col"
    >
      {/* Image / Category banner */}
      <div className="relative h-44 overflow-hidden flex-shrink-0 bg-[#0a0d17]">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={issue.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
            loading="lazy"
          />
        )}
        {/* Fallback gradient banner */}
        {!imageUrl && (
          <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-25 flex items-center justify-center`}>
            <span className="text-5xl opacity-50">{cat.icon}</span>
          </div>
        )}
        {/* Bottom fade on images */}
        {imageUrl && (
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0d1117] to-transparent" />
        )}
        {/* Category chip */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold backdrop-blur-sm ${cat.badge}`} style={{ border: 'inherit' }}>
            {cat.icon} {issue.category}
          </span>
        </div>
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={issue.status} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2 mb-1.5">
          {issue.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {issue.description}
        </p>

        {/* Metadata */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-1.5 text-xs text-slate-500">
            <MapPin size={12} className="mt-0.5 flex-shrink-0 text-indigo-500" />
            <span className="line-clamp-1">{issue.locationText}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Clock size={12} className="flex-shrink-0" />
            <span>{formatRelativeTime(issue.createdAt)}</span>
          </div>
          {issue.userId?.email && (
            <p className="text-[11px] text-slate-600 truncate">
              by {issue.userId.email}
            </p>
          )}
        </div>

        {/* Action slot */}
        {action && (
          <div className="mt-4 pt-3 border-t border-white/[0.05]">
            {action}
          </div>
        )}
      </div>
    </motion.div>
  )
}
