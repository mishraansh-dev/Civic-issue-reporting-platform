import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

/**
 * FAB — Floating action button.
 * Positioned fixed bottom-right. Navigates to /report (the wizard).
 * Only shown on the user dashboard.
 */
export default function FAB() {
  const navigate = useNavigate()

  return (
    <motion.button
      onClick={() => navigate('/report')}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
                 bg-indigo-600 hover:bg-indigo-500 text-white
                 shadow-[0_4px_20px_rgba(99,102,241,0.45)]
                 flex items-center justify-center transition-colors"
      aria-label="Report a new issue"
      title="Report a new issue"
    >
      <Plus size={24} strokeWidth={2.5} />
    </motion.button>
  )
}
