import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORIES, CATEGORY_INFO } from '../../utils/helpers'
import { cn } from '../../utils/helpers'

const LABEL = 'block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2'

/**
 * StepDetails — Step 3 of the Report Wizard.
 * Collects: title, category (pill grid on desktop, select on mobile), description.
 */
export default function StepDetails({ data, onChange, onNext }) {
  const { title = '', category = '', description = '' } = data

  const canContinue = title.trim() && category && description.trim()

  const set = (field) => (e) => onChange({ ...data, [field]: e.target.value })

  return (
    <div className="flex flex-col gap-5">
      <p className="text-slate-400 text-sm text-center">
        Add a few details so the right authority can act on it.
      </p>

      {/* Title */}
      <div>
        <label className={LABEL}>
          Issue Title <span className="text-red-400 normal-case tracking-normal">*</span>
        </label>
        <input
          value={title}
          onChange={set('title')}
          placeholder="Brief description of the problem…"
          maxLength={100}
          className="form-input"
          autoFocus
        />
        <p className="text-[11px] text-slate-600 mt-1 text-right tabular-nums">{title.length}/100</p>
      </div>

      {/* Category — desktop pills */}
      <div>
        <label className={LABEL}>
          Category <span className="text-red-400 normal-case tracking-normal">*</span>
        </label>
        {/* Desktop: pill grid */}
        <div className="hidden sm:grid grid-cols-5 gap-2">
          {CATEGORIES.map((cat) => {
            const info = CATEGORY_INFO[cat] ?? {}
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onChange({ ...data, category: cat })}
                className={cn('category-pill', category === cat && 'selected')}
                aria-pressed={category === cat}
              >
                <span className="text-xl leading-none">{info.icon}</span>
                <span>{cat}</span>
              </button>
            )
          })}
        </div>
        {/* Mobile: select */}
        <div className="sm:hidden">
          <select
            value={category}
            onChange={set('category')}
            className="form-input"
          >
            <option value="">Select a category…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_INFO[c]?.icon} {c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={LABEL}>
          Description <span className="text-red-400 normal-case tracking-normal">*</span>
        </label>
        <textarea
          value={description}
          onChange={set('description')}
          placeholder="Describe the issue in detail — what you see, when it started, how it affects people…"
          rows={4}
          maxLength={1000}
          className="form-input resize-none"
        />
        <p className="text-[11px] text-slate-600 mt-1 text-right tabular-nums">{description.length}/1000</p>
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className="btn-primary w-full py-3"
      >
        Review & Submit →
      </button>
    </div>
  )
}
