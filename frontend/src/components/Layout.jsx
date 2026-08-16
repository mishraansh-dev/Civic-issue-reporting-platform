import { motion } from 'framer-motion'
import Sidebar from './Sidebar'

const pageVariants = {
  initial:  { opacity: 0, y: 6 },
  animate:  { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: 'easeOut' },
}

export default function Layout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Page header */}
        {(title || subtitle) && (
          <header className="px-6 lg:px-8 pt-6 pb-5 border-b border-white/[0.05] lg:pt-8">
            {title && (
              <h2 className="text-xl font-semibold text-slate-100 tracking-tight">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </header>
        )}

        {/* Scrollable content */}
        <motion.div
          className="flex-1 p-6 lg:p-8 overflow-y-auto"
          initial={pageVariants.initial}
          animate={pageVariants.animate}
          transition={pageVariants.transition}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
