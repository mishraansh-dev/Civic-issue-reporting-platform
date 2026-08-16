import { useState, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Filter, Search, Inbox, TrendingUp,
  ClipboardList, Clock, Wrench, CheckCircle, X,
  Map, BarChart2, List, Timer, AlertTriangle,
} from 'lucide-react'
import Layout from '../components/Layout'
import IssueCard from '../components/IssueCard'
import StatsCard from '../components/StatsCard'
import StatusBadge from '../components/StatusBadge'
import SkeletonCard from '../components/SkeletonCard'
import { issueAPI } from '../services/api'
import { useSocket } from '../hooks/useSocket'
import { CATEGORIES, STATUSES, STATUS_INFO, CATEGORY_INFO, formatRelativeTime } from '../utils/helpers'
import { cn } from '../utils/helpers'

// Dynamically import heavy components
const DashboardCharts = lazy(() => import('../components/charts/DashboardCharts'))
const AuthorityMap    = lazy(() => import('../components/map/AuthorityMap'))

const STATUS_OPTIONS   = [{ value: 'all', label: 'All Statuses' },   ...STATUSES.map((s) => ({ value: s, label: STATUS_INFO[s].label }))]
const CATEGORY_OPTIONS = [{ value: 'all', label: 'All Categories' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]

/** SLA badge based on hours since creation */
function SlaBadge({ createdAt }) {
  const diffH = (Date.now() - new Date(createdAt).getTime()) / 3_600_000
  if (diffH < 24)  return <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-semibold">New</span>
  if (diffH < 72)  return <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-semibold flex items-center gap-1"><Timer size={9} /> Aging</span>
  return <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400 font-semibold flex items-center gap-1"><AlertTriangle size={9} /> Overdue</span>
}

/** Chart placeholder skeleton */
function ChartSkeleton() {
  return <div className="card rounded-2xl h-64 skeleton" />
}

export default function AuthorityDashboard() {
  const qc = useQueryClient()
  const [filters, setFilters]   = useState({ category: 'all', status: 'all', search: '' })
  const [view,    setView]      = useState('list') // 'list' | 'map' | 'charts'

  // Real-time socket updates
  useSocket((data) => {
    qc.setQueryData(['all-issues', filters], (old) =>
      old?.map((issue) => issue._id === data.id ? { ...issue, status: data.status } : issue)
    )
    toast.success('Issue status updated in real-time ⚡')
  })

  const { data: issues = [], isLoading, isError } = useQuery({
    queryKey: ['all-issues', filters],
    queryFn: () => issueAPI.getAllIssues({
      ...(filters.category !== 'all' && { category: filters.category }),
      ...(filters.status   !== 'all' && { status:   filters.status }),
      ...(filters.search              && { search:   filters.search }),
    }).then((r) => r.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['issue-stats'],
    queryFn: () => issueAPI.getStats().then((r) => r.data),
    refetchInterval: 30_000,
  })

  // Computed stats
  const resolutionRate = stats?.total
    ? Math.round(((stats.byStatus?.resolved || 0) / stats.total) * 100)
    : 0

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => issueAPI.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-issues'] })
      qc.invalidateQueries({ queryKey: ['issue-stats'] })
      toast.success('Status updated')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  })

  const handleStatusChange = (id, status) => statusMutation.mutate({ id, status })
  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }))
  const hasFilters = filters.category !== 'all' || filters.status !== 'all' || filters.search

  return (
    <Layout title="Authority Dashboard" subtitle="Monitor and manage all civic issues">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatsCard label="Total"       value={stats?.total}                 icon={ClipboardList} accent="indigo"  index={0} />
        <StatsCard label="Pending"     value={stats?.byStatus?.pending}     icon={Clock}         accent="amber"   index={1} />
        <StatsCard label="In Progress" value={stats?.byStatus?.in_progress} icon={Wrench}        accent="blue"    index={2} />
        <StatsCard label="Resolved"    value={stats?.byStatus?.resolved}    icon={CheckCircle}   accent="emerald" index={3} />
        <StatsCard label="Resolution %" value={resolutionRate}              icon={TrendingUp}    accent="emerald" index={4} />
        <StatsCard label="Issues (All)" value={issues.length}               icon={Filter}        accent="default" index={5} />
      </div>

      {/* Category breakdown */}
      {stats?.byCategory && Object.keys(stats.byCategory).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card rounded-2xl p-5 mb-8"
        >
          <h3 className="section-title mb-5">
            <TrendingUp size={16} className="text-indigo-500" />
            By Category
          </h3>
          <div className="space-y-3.5">
            {CATEGORIES.map((cat) => {
              const count = stats.byCategory[cat] || 0
              const pct   = stats.total ? Math.round((count / stats.total) * 100) : 0
              const info  = CATEGORY_INFO[cat] ?? {}
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-base w-5 text-center flex-shrink-0">{info.icon}</span>
                  <div className="w-24 flex-shrink-0">
                    <p className="text-xs text-slate-400 font-medium">{cat}</p>
                  </div>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                      className="h-full rounded-full bg-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 w-16 justify-end">
                    <span className="text-xs font-semibold text-slate-300 tabular-nums">{count}</span>
                    <span className="text-[10px] text-slate-600 tabular-nums">{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-5">
        {[
          { id: 'list',   icon: List,    label: 'List' },
          { id: 'map',    icon: Map,     label: 'Map' },
          { id: 'charts', icon: BarChart2, label: 'Charts' },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              view === v.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/8'
            )}
          >
            <v.icon size={13} /> {v.label}
          </button>
        ))}
      </div>

      {/* Map view */}
      {view === 'map' && (
        <div className="mb-8">
          <Suspense fallback={<div className="card rounded-2xl h-96 skeleton" />}>
            <AuthorityMap issues={issues} />
          </Suspense>
        </div>
      )}

      {/* Charts view */}
      {view === 'charts' && (
        <Suspense fallback={<div className="grid grid-cols-2 gap-5 mb-8"><ChartSkeleton /><ChartSkeleton /></div>}>
          <DashboardCharts issues={issues} />
        </Suspense>
      )}

      {/* Filters (shown in list view) */}
      {view === 'list' && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card rounded-2xl p-4 mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 text-slate-500 flex-shrink-0 self-center">
                <Filter size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">Filter</span>
              </div>
              <div className="flex-1 relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  value={filters.search}
                  onChange={(e) => setFilter('search', e.target.value)}
                  placeholder="Search title, description, location…"
                  className="form-input pl-8 py-2 text-xs"
                />
              </div>
              <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)}
                className="form-input py-2 text-xs flex-shrink-0 w-full sm:w-40">
                {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}
                className="form-input py-2 text-xs flex-shrink-0 w-full sm:w-36">
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {hasFilters && (
                <button onClick={() => setFilters({ category: 'all', status: 'all', search: '' })}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 font-medium whitespace-nowrap flex-shrink-0 transition-colors">
                  <X size={13} /> Clear
                </button>
              )}
            </div>
          </motion.div>

          {/* Results header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">
              All Reports
              {!isLoading && <span className="text-sm font-normal text-slate-600">({issues.length})</span>}
            </h3>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {isError && (
            <div className="card rounded-2xl p-8 text-center">
              <p className="text-red-400 text-sm">Failed to load issues. Please refresh.</p>
            </div>
          )}

          {!isLoading && !isError && issues.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card rounded-2xl p-14 text-center">
              <Inbox size={36} className="mx-auto text-slate-700 mb-3" />
              <p className="text-slate-400 font-medium text-sm">No issues match the current filters</p>
              {hasFilters && (
                <button onClick={() => setFilters({ category: 'all', status: 'all', search: '' })}
                  className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 transition-colors">
                  Clear filters
                </button>
              )}
            </motion.div>
          )}

          {!isLoading && !isError && issues.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {issues.map((issue, i) => (
                <IssueCard
                  key={issue._id}
                  issue={issue}
                  index={i}
                  action={
                    <div>
                      {/* SLA badge */}
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Update Status</p>
                        <SlaBadge createdAt={issue.createdAt} />
                      </div>
                      {/* Location warning for issues without GPS */}
                      {!issue.latitude && !issue.longitude && (
                        <p className="text-[10px] text-slate-700 mb-2 flex items-center gap-1">
                          <span>📍</span> Location unavailable — not shown on map
                        </p>
                      )}
                      <div className="flex gap-1.5 flex-wrap">
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(issue._id, s)}
                            disabled={issue.status === s || statusMutation.isPending}
                            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all border ${
                              issue.status === s
                                ? STATUS_INFO[s].badge + ' cursor-default'
                                : 'bg-white/5 border-white/8 text-slate-500 hover:bg-white/10 hover:text-slate-300 disabled:opacity-40'
                            }`}
                          >
                            {STATUS_INFO[s].icon} {STATUS_INFO[s].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
