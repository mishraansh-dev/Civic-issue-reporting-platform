import { useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { CATEGORIES } from '../../utils/helpers'

/* ── Tooltip styles ──────────────────────────────────────────────────────────── */
const tooltipStyle = {
  backgroundColor: '#0d1117',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  color: '#e2e8f0',
  fontSize: 12,
}

/** Compute issues per category from array */
function getCategoryData(issues) {
  return CATEGORIES.map((cat) => ({
    name: cat,
    count: issues.filter((i) => i.category === cat).length,
  }))
}

/** Compute issues per day for the last N days */
function getDailyData(issues, days = 7) {
  const now = new Date()
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (days - 1 - i))
    const start = new Date(d.setHours(0, 0, 0, 0))
    const end   = new Date(new Date(start).setHours(23, 59, 59, 999))
    return {
      date: start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      count: issues.filter((iss) => {
        const t = new Date(iss.createdAt)
        return t >= start && t <= end
      }).length,
    }
  })
}

/**
 * DashboardCharts — Recharts bar + line charts for the authority dashboard.
 * Computes all data client-side from the existing `issues` array.
 * Zero additional API calls.
 */
export default function DashboardCharts({ issues = [] }) {
  const categoryData = useMemo(() => getCategoryData(issues), [issues])
  const dailyData    = useMemo(() => getDailyData(issues, 7),  [issues])

  const CATEGORY_COLORS = {
    Road: '#f97316', Water: '#3b82f6', Electricity: '#eab308', Garbage: '#22c55e', Other: '#8b5cf6',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
      {/* Issues by Category */}
      <div className="card rounded-2xl p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Issues by Category
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryData} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
            <Bar
              dataKey="count"
              name="Issues"
              radius={[6, 6, 0, 0]}
              fill="#6366f1"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Reports per Day (last 7 days) */}
      <div className="card rounded-2xl p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Reports — Last 7 Days
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dailyData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="count"
              name="Reports"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#818cf8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
