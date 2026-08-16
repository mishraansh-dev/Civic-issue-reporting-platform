import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  FileText, ChevronDown, ChevronUp, Inbox,
  ClipboardList, Clock, Wrench, CheckCircle,
} from 'lucide-react'
import Layout from '../components/Layout'
import IssueCard from '../components/IssueCard'
import StatsCard from '../components/StatsCard'
import ReportIssueForm from '../components/ReportIssueForm'
import SkeletonCard from '../components/SkeletonCard'
import IssueTimeline from '../components/IssueTimeline'
import FAB from '../components/FAB'
import { issueAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'

/** Time-based greeting */
function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  if (h >= 17 && h < 21) return 'Good evening'
  return 'Good night'
}

/** IssueCard wrapper that adds the status timeline below the card */
function IssueCardWithTimeline({ issue, index }) {
  return (
    <div className="flex flex-col gap-2">
      <IssueCard issue={issue} index={index} />
      <div className="px-4 pb-2">
        <IssueTimeline status={issue.status} />
      </div>
    </div>
  )
}

export default function UserDashboard() {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)

  const { data: issues = [], isLoading, isError } = useQuery({
    queryKey: ['my-issues'],
    queryFn: () => issueAPI.getMyIssues().then((r) => r.data),
  })

  const pending    = issues.filter((i) => i.status === 'pending').length
  const inProgress = issues.filter((i) => i.status === 'in_progress').length
  const resolved   = issues.filter((i) => i.status === 'resolved').length

  const firstName = user?.email?.split('@')[0] ?? 'there'
  const greeting  = getGreeting()

  return (
    <Layout
      title={`${greeting}, ${firstName} 👋`}
      subtitle="Track your reported issues and submit new ones"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Reported" value={issues.length} icon={ClipboardList} accent="indigo"  index={0} />
        <StatsCard label="Pending"         value={pending}       icon={Clock}         accent="amber"   index={1} />
        <StatsCard label="In Progress"     value={inProgress}    icon={Wrench}        accent="blue"    index={2} />
        <StatsCard label="Resolved"        value={resolved}      icon={CheckCircle}   accent="emerald" index={3} />
      </div>

      {/* Inline Report Section (quick access on dashboard) */}
      <div className="card rounded-2xl overflow-hidden mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
          aria-expanded={showForm}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">+</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-100 text-sm">Quick Report</p>
              <p className="text-xs text-slate-500">Submit a civic problem with the simple form</p>
            </div>
          </div>
          <div className="text-slate-500">
            {showForm ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          </div>
        </button>
        <AnimatePresence initial={false}>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-6 pt-1 border-t border-white/[0.05]">
                <div className="pt-5">
                  <ReportIssueForm onSuccess={() => setShowForm(false)} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* My Issues */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="section-title">
            <FileText size={17} className="text-indigo-500" />
            My Reports
            {!isLoading && (
              <span className="text-sm font-normal text-slate-600">({issues.length})</span>
            )}
          </h3>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {isError && (
          <div className="card rounded-2xl p-8 text-center">
            <p className="text-red-400 text-sm">Failed to load issues. Please refresh.</p>
          </div>
        )}

        {!isLoading && !isError && issues.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card rounded-2xl p-12 text-center"
          >
            <Inbox size={36} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-400 font-medium text-sm">No issues reported yet</p>
            <p className="text-slate-600 text-xs mt-1">Use the Report button to get started</p>
          </motion.div>
        )}

        {!isLoading && !isError && issues.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {issues.map((issue, i) => (
              <IssueCardWithTimeline key={issue._id} issue={issue} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button — navigates to /report (wizard) */}
      <FAB />
    </Layout>
  )
}
