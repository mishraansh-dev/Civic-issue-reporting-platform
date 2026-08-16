import { cn, STATUS_INFO } from '../utils/helpers'

/** Pulsing dot for active statuses */
function PulsingDot({ colorClass, pulse }) {
  return (
    <span className="relative flex h-1.5 w-1.5">
      {pulse && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping-slow',
            colorClass
          )}
        />
      )}
      <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', colorClass)} />
    </span>
  )
}

export default function StatusBadge({ status, size = 'md' }) {
  const info = STATUS_INFO[status] ?? STATUS_INFO.pending
  const pulse = status === 'pending' || status === 'in_progress'

  return (
    <span
      className={cn(
        'status-badge border',
        info.badge,
        size === 'sm' && 'text-[10px] px-2 py-0.5 gap-1',
        size === 'lg' && 'text-sm px-3 py-1.5'
      )}
    >
      <PulsingDot colorClass={info.dot} pulse={pulse} />
      {info.label}
    </span>
  )
}
