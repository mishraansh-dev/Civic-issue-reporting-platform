import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  LayoutDashboard,
  PlusCircle,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../utils/helpers'
import { toast } from 'sonner'

const USER_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
  { to: '/report',    icon: PlusCircle,      label: 'Report Issue' },
]

const AUTHORITY_LINKS = [
  { to: '/admin', icon: ShieldCheck, label: 'All Issues' },
]

function NavItem({ to, icon: Icon, label, isActive, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn('nav-item', isActive && 'active')}
    >
      <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
      <span>{label}</span>
    </Link>
  )
}

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const links = user?.role === 'authority' ? AUTHORITY_LINKS : USER_LINKS

  const handleLogout = () => {
    logout()
    toast.success('Signed out successfully')
    navigate('/login')
  }

  const initial = user?.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <MapPin size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100 leading-none">CivicWatch</p>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider mt-0.5">Issue Reporter</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 pb-2 pt-1">
          Navigation
        </p>
        {links.map((link) => (
          <NavItem
            key={link.to}
            {...link}
            isActive={location.pathname === link.to}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/[0.05] p-2">
        {/* Notification placeholder */}
        <button className="nav-item w-full" aria-label="Notifications">
          <Bell size={17} strokeWidth={1.8} />
          <span>Notifications</span>
          <span className="ml-auto text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-semibold">
            Soon
          </span>
        </button>

        {/* User info + logout */}
        <div className="mt-1 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-200 font-medium truncate">{user?.email}</p>
              <span className={cn(
                'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                user?.role === 'authority'
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'bg-white/5 text-slate-500'
              )}>
                {user?.role === 'authority' ? '🛡 Authority' : '👤 Citizen'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition-colors text-xs font-medium"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-60 h-screen sticky top-0 flex-shrink-0"
        style={{
          background: 'rgba(9, 12, 22, 0.97)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-xl bg-[#0d1117] border border-white/10 flex items-center justify-center text-slate-300 shadow-lg"
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 w-60 z-50 lg:hidden flex flex-col"
              style={{
                background: 'rgba(9, 12, 22, 0.99)',
                borderRight: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
