import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff, MapPin, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const REQUIREMENTS = [
  { label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { label: 'Contains a letter',     test: (p) => /[a-zA-Z]/.test(p) },
  { label: 'Contains a number',     test: (p) => /\d/.test(p) },
]

function strengthScore(p) {
  return REQUIREMENTS.filter((r) => r.test(p)).length
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Strong']
const STRENGTH_COLORS = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500']

export default function Signup() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const { signup } = useAuth()
  const navigate   = useNavigate()
  const score      = password ? strengthScore(password) : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await signup(email, password)
      toast.success('Account created! Welcome to CivicWatch 🎉')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: Branding (desktop only) ── */}
      <div
        className="hidden lg:flex lg:flex-col w-[420px] xl:w-[480px] flex-shrink-0 relative overflow-hidden"
        style={{
          background: '#07090f',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-violet-600/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-60 h-60 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col h-full p-10 relative z-10">
          <div className="flex items-center gap-2.5 mb-auto">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-100">CivicWatch</span>
          </div>

          <div className="my-auto">
            <h1 className="text-3xl font-bold text-slate-100 leading-tight mb-3">
              Join your<br />
              <span className="gradient-text">community.</span>
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-xs">
              Create a free account to start reporting civic issues in your area and help make your community better.
            </p>
            <div className="space-y-3">
              {['Free to use, forever', 'No credit card required', 'Instant issue tracking'].map((t) => (
                <div key={t} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-700 mt-auto">
            © {new Date().getFullYear()} CivicWatch. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right panel: Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none lg:hidden overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-violet-600/6 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm relative"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-100">CivicWatch</span>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-100">Create account</h2>
            <p className="text-sm text-slate-500 mt-1">Start reporting civic issues in your area</p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-5"
              >
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="form-input pl-9"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="signup-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                  className="form-input pl-9 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Strength bar */}
              <AnimatePresence>
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2.5 space-y-2"
                  >
                    {/* Bar */}
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            i <= score ? STRENGTH_COLORS[score] : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Strength:{' '}
                      <span className={score >= 3 ? 'text-emerald-400' : score >= 2 ? 'text-amber-400' : 'text-red-400'}>
                        {STRENGTH_LABELS[score]}
                      </span>
                    </p>
                    {/* Requirements checklist */}
                    <div className="space-y-1">
                      {REQUIREMENTS.map((req) => {
                        const met = req.test(password)
                        return (
                          <div key={req.label} className="flex items-center gap-2 text-[11px]">
                            <CheckCircle2
                              size={11}
                              className={met ? 'text-emerald-400' : 'text-slate-700'}
                            />
                            <span className={met ? 'text-emerald-400' : 'text-slate-600'}>
                              {req.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              id="signup-submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-1"
            >
              {loading ? (
                <div className="spinner w-4 h-4" />
              ) : (
                <>Create Account <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
