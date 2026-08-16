import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Camera, MapPin, FileText, Send, ArrowLeft } from 'lucide-react'

import StepCapture  from './StepCapture'
import StepLocation from './StepLocation'
import StepDetails  from './StepDetails'
import StepReview   from './StepReview'
import { issueAPI } from '../../services/api'

/* ── Step config ──────────────────────────────────────────────────────────── */
const STEPS = [
  { id: 'capture',  label: 'Photo',    icon: Camera    },
  { id: 'location', label: 'Location', icon: MapPin    },
  { id: 'details',  label: 'Details',  icon: FileText  },
  { id: 'review',   label: 'Submit',   icon: Send      },
]

/* ── Slide animation variants ─────────────────────────────────────────────── */
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center:        { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

/**
 * ReportWizard — 4-step camera-first report wizard.
 * State flows downward; each step calls the provided callback to advance.
 */
export default function ReportWizard() {
  const navigate     = useNavigate()
  const qc           = useQueryClient()
  const [step,     setStep]     = useState(0)   // 0-3
  const [direction, setDirection] = useState(1)  // 1=forward -1=backward
  const [success,  setSuccess]  = useState(false)

  const [wizardData, setWizardData] = useState({
    imageFile:    null,
    imagePreview: null,
    latitude:     '',
    longitude:    '',
    locationText: '',
    title:        '',
    category:     '',
    description:  '',
  })

  /* ── Navigation helpers ─────────────────────────────────────────────────── */
  const goTo = (n) => {
    setDirection(n > step ? 1 : -1)
    setStep(n)
  }
  const goBack = () => goTo(step - 1)

  /* ── Submit ─────────────────────────────────────────────────────────────── */
  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      const { imageFile, imagePreview, ...fields } = wizardData
      Object.entries(fields).forEach(([k, v]) => v && fd.append(k, v))
      if (imageFile) fd.append('image', imageFile)
      return issueAPI.create(fd)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-issues'] })
      setSuccess(true)
      toast.success('Issue reported successfully!')
      setTimeout(() => navigate('/dashboard'), 2800)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.')
    },
  })

  /* ── Step handlers ──────────────────────────────────────────────────────── */
  const onCapture  = (imageFile, imagePreview) => { setWizardData((d) => ({ ...d, imageFile, imagePreview })); goTo(1) }
  const onLocation = (loc)     => { setWizardData((d) => ({ ...d, ...loc })); goTo(2) }
  const onDetails  = ()        => goTo(3)

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        {/* Progress line */}
        <div className="absolute inset-y-1/2 left-0 right-0 h-px bg-white/5" />
        <div
          className="absolute inset-y-1/2 left-0 h-px bg-indigo-500/60 transition-all duration-500"
          style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((s, i) => {
          const Icon  = s.icon
          const done  = i < step
          const active = i === step
          return (
            <div key={s.id} className="flex flex-col items-center gap-1.5 relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  done   ? 'bg-indigo-600 text-white'
                  : active ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                  : 'bg-[#0d1117] border border-white/10 text-slate-600'
                }`}
              >
                <Icon size={15} />
              </div>
              <span className={`text-[10px] font-semibold hidden sm:block ${active ? 'text-indigo-400' : done ? 'text-slate-400' : 'text-slate-700'}`}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Step title */}
      <div className="mb-6 text-center">
        <h2 className="text-lg font-semibold text-slate-100">
          {step === 0 && 'Capture the Issue'}
          {step === 1 && 'Confirm Location'}
          {step === 2 && 'Add Details'}
          {step === 3 && (success ? 'Report Submitted!' : 'Review & Submit')}
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">Step {step + 1} of {STEPS.length}</p>
      </div>

      {/* Step content — animated slide */}
      <div className="overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            {step === 0 && <StepCapture  onCapture={onCapture} />}
            {step === 1 && <StepLocation onLocation={onLocation} />}
            {step === 2 && (
              <StepDetails
                data={wizardData}
                onChange={(d) => setWizardData(d)}
                onNext={onDetails}
              />
            )}
            {step === 3 && (
              <StepReview
                data={wizardData}
                onSubmit={() => mutation.mutate()}
                submitting={mutation.isPending}
                success={success}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back button */}
      {step > 0 && !success && (
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mt-5 self-start"
        >
          <ArrowLeft size={13} /> Back
        </button>
      )}
    </div>
  )
}
