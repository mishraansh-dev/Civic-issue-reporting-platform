import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff, MapPin, Shield, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const FEATURES = [
  { icon: '📍', text: 'Geo-tagged issue reports with GPS accuracy' },
  { icon: '⚡', text: 'Real-time status updates via live sync' },
  { icon: '🛡️', text: 'Secure, role-based access control' },
  { icon: '📊', text: 'Transparent tracking for residents' },
]

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success('Welcome back!')
      navigate(user.role === 'authority' ? '/admin' : '/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
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
        {/* Subtle ambient blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col h-full p-10 relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-auto">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-100">CivicWatch</span>
          </div>

          {/* Main copy */}
          <div className="my-auto">
            <h1 className="text-3xl font-bold text-slate-100 leading-tight mb-3">
              Report. Track.<br />
              <span className="gradient-text">Resolve.</span>
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-xs">
              A civic issue reporting platform for residents and municipal authorities to communicate and resolve local problems.
            </p>
            <ul className="space-y-3.5">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                  <span className="mt-0.5 text-base leading-none">{f.icon}</span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-slate-700 mt-auto">
            © {new Date().getFullYear()} CivicWatch. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right panel: Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Mobile ambient */}
        <div className="absolute inset-0 pointer-events-none lg:hidden overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/6 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl" />
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
            <h2 className="text-2xl font-bold text-slate-100">Sign in</h2>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to continue</p>
          </div>

          {/* Error banner */}
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
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="login-email"
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
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-1"
            >
              {loading ? (
                <div className="spinner w-4 h-4" />
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            No account?{' '}
            <Link to="/signup" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Create one free
            </Link>
          </p>

          {/* Authority hint */}
          <div className="mt-5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-start gap-2.5">
            <Shield size={13} className="text-slate-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="text-slate-400 font-medium">Authority officials</span> — use your seeded credentials.
              Public signup creates citizen accounts only.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
