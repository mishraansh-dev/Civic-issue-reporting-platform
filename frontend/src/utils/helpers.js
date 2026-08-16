import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind class names safely */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/** Format a date to a localised string */
export function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/** Human-readable relative time */
export function formatRelativeTime(date) {
  if (!date) return ''
  const diffMs = Date.now() - new Date(date).getTime()
  const m = Math.floor(diffMs / 60_000)
  const h = Math.floor(diffMs / 3_600_000)
  const d = Math.floor(diffMs / 86_400_000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d < 7) return `${d}d ago`
  return formatDate(date)
}

// ── Static maps ──────────────────────────────────────────────────────────────

export const CATEGORY_INFO = {
  Road: {
    icon: '🛣️',
    gradient: 'from-orange-500 to-amber-400',
    badge: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
  },
  Water: {
    icon: '💧',
    gradient: 'from-blue-500 to-cyan-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  },
  Electricity: {
    icon: '⚡',
    gradient: 'from-yellow-400 to-amber-300',
    badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25',
  },
  Garbage: {
    icon: '🗑️',
    gradient: 'from-green-500 to-emerald-400',
    badge: 'bg-green-500/10 text-green-400 border-green-500/25',
  },
  Other: {
    icon: '📋',
    gradient: 'from-purple-500 to-indigo-400',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
  },
}

export const STATUS_INFO = {
  pending: {
    label: 'Pending',
    icon: '⏳',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  in_progress: {
    label: 'In Progress',
    icon: '🔧',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400',
  },
  resolved: {
    label: 'Resolved',
    icon: '✅',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
}

export const CATEGORIES = ['Road', 'Water', 'Electricity', 'Garbage', 'Other']
export const STATUSES = ['pending', 'in_progress', 'resolved']
