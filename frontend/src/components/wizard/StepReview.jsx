import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Tag, FileText, Loader2, CheckCircle2 } from 'lucide-react'
import { CATEGORY_INFO } from '../../utils/helpers'
import AIInsightsCard from '../AIInsightsCard'

/**
 * StepReview — Step 4 of the Report Wizard.
 * Shows a summary of all collected data, the AI insights card,
 * and the final submit button with success animation.
 */
export default function StepReview({ data, onSubmit, submitting, success }) {
  const { imagePreview, locationText, title, category, description, imageFile, latitude, longitude } = data
  const cat = CATEGORY_INFO[category] ?? CATEGORY_INFO.Other

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5 py-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"
        >
          <CheckCircle2 size={40} className="text-emerald-400" />
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-slate-100">Issue Reported!</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-xs">
            Your report has been submitted successfully. The local authority will review it shortly.
          </p>
        </div>
        <p className="text-xs text-slate-600">You can track the status on your dashboard.</p>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-slate-400 text-sm text-center">
        Review your report before submitting.
      </p>

      {/* Image thumbnail */}
      {imagePreview && (
        <div className="rounded-xl overflow-hidden border border-white/10">
          <img src={imagePreview} alt="Issue" className="w-full object-cover" style={{ maxHeight: 200 }} />
        </div>
      )}

      {/* Summary */}
      <div className="card rounded-2xl divide-y divide-white/[0.05]">
        <SummaryRow icon={Tag} label="Category">
          <span className="flex items-center gap-1.5 text-sm text-slate-200 font-medium">
            <span>{cat.icon}</span> {category}
          </span>
        </SummaryRow>
        <SummaryRow icon={FileText} label="Title">
          <span className="text-sm text-slate-200">{title}</span>
        </SummaryRow>
        <SummaryRow icon={MapPin} label="Location">
          <span className="text-sm text-slate-400 line-clamp-2">{locationText || 'Not specified'}</span>
        </SummaryRow>
        {description && (
          <div className="px-4 py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Description</p>
            <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
          </div>
        )}
      </div>

      {/* AI Insights — only in review step, only if image available */}
      {imageFile && (
        <AIInsightsCard
          imageFile={imageFile}
          category={category}
          location={latitude && longitude ? { lat: parseFloat(latitude), lon: parseFloat(longitude) } : null}
        />
      )}

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={submitting}
        className="btn-primary w-full py-3 text-base"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Submitting…
          </>
        ) : (
          'Submit Report'
        )}
      </button>
    </div>
  )
}

function SummaryRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Icon size={14} className="text-slate-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  )
}
