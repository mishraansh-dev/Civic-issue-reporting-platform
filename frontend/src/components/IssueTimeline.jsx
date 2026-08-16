import { cn } from '../utils/helpers'

const STEPS = [
  { key: 'pending',     label: 'Submitted' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved',    label: 'Resolved' },
]

const STATUS_INDEX = { pending: 0, in_progress: 1, resolved: 2 }

/**
 * IssueTimeline — compact horizontal status progress bar for issue cards.
 * Designed to be easily extended when more status steps are added.
 */
export default function IssueTimeline({ status }) {
  const current = STATUS_INDEX[status] ?? 0

  return (
    <div className="flex items-center gap-0 w-full" role="progressbar" aria-valuenow={current} aria-valuemax={STEPS.length - 1}>
      {STEPS.map((step, i) => {
        const done   = i < current
        const active = i === current
        const isLast = i === STEPS.length - 1

        return (
          <div key={step.key} className="flex items-center flex-1">
            {/* Step dot */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  done   && 'bg-emerald-500',
                  active && 'bg-indigo-400 ring-2 ring-indigo-400/30',
                  !done && !active && 'bg-white/10'
                )}
              />
              <span
                className={cn(
                  'text-[9px] mt-1 font-medium whitespace-nowrap',
                  active && 'text-indigo-400',
                  done   && 'text-emerald-500',
                  !done && !active && 'text-slate-700'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  'flex-1 h-px mx-1 transition-colors',
                  i < current ? 'bg-emerald-500/40' : 'bg-white/8'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
