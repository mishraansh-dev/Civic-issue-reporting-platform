import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { classifyImage }    from '../services/ai/imageClassifier'
import { predictSeverity }  from '../services/ai/severityPredictor'
import { detectDuplicates } from '../services/ai/duplicateDetector'
import { estimateResolution } from '../services/ai/summaryService'

const SEVERITY_COLOR = { Low: 'text-emerald-400', Medium: 'text-amber-400', High: 'text-red-400', Critical: 'text-red-500' }

/**
 * AIInsightsCard — AI analysis placeholder displayed during wizard review.
 *
 * Shows mock data from the AI service stubs.
 * Marked clearly as "AI Preview" to set honest expectations.
 * Architecture: replace the service imports with real Gemini Vision calls
 * and this component requires zero changes.
 */
export default function AIInsightsCard({ imageFile, category, location }) {
  const [insights,  setInsights]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [expanded,  setExpanded]  = useState(true)

  useEffect(() => {
    if (!imageFile) { setLoading(false); return }

    let cancelled = false
    setLoading(true)

    Promise.all([
      classifyImage(imageFile),
      predictSeverity(imageFile, category),
      detectDuplicates(location?.lat, location?.lon),
      estimateResolution(category),
    ]).then(([classification, severity, duplicates, resolution]) => {
      if (!cancelled) {
        setInsights({ classification, severity, duplicates, resolution })
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [imageFile, category, location])

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-indigo-400" />
          <span className="text-sm font-semibold text-slate-200">Image Analysis</span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-semibold">
            AI Preview
          </span>
        </div>
        {expanded ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-indigo-500/15 pt-3">
              {loading ? (
                <div className="space-y-2.5">
                  {[80, 60, 70, 55].map((w, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="skeleton h-3 rounded" style={{ width: '35%' }} />
                      <div className="skeleton h-3 rounded" style={{ width: `${w}%` }} />
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-600 mt-2">Analysing image…</p>
                </div>
              ) : insights ? (
                <div className="space-y-3">
                  <InsightRow
                    label="Civic Issue Detected"
                    value={insights.classification.isCivicIssue ? '✅ Yes' : '❌ No'}
                    valueClass={insights.classification.isCivicIssue ? 'text-emerald-400' : 'text-red-400'}
                  />
                  <InsightRow
                    label="Suggested Category"
                    value={`${insights.classification.category} (${Math.round(insights.classification.confidence * 100)}% confidence)`}
                    valueClass="text-slate-200"
                  />
                  <InsightRow
                    label="Severity"
                    value={insights.severity.severity}
                    valueClass={SEVERITY_COLOR[insights.severity.severity] ?? 'text-slate-300'}
                  />
                  <InsightRow
                    label="Duplicates Nearby"
                    value={insights.duplicates.duplicatesNearby === 0 ? 'None found' : `${insights.duplicates.duplicatesNearby} nearby`}
                    valueClass="text-slate-300"
                  />
                  <InsightRow
                    label="Est. Resolution"
                    value={insights.resolution.estimatedHours}
                    valueClass="text-slate-300"
                  />
                  <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                    These insights are generated by AI preview services and may not reflect actual outcomes. Real AI integration coming soon.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Analysis unavailable.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function InsightRow({ label, value, valueClass }) {
  return (
    <div className="flex items-start justify-between gap-4 text-xs">
      <span className="text-slate-500 flex-shrink-0">{label}</span>
      <span className={`font-medium text-right ${valueClass}`}>{value}</span>
    </div>
  )
}
