import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { MapPin } from 'lucide-react'
import StatusBadge from '../StatusBadge'
import { CATEGORY_INFO, formatRelativeTime } from '../../utils/helpers'
import '../../utils/leafletSetup'

/** Create a coloured circle div-icon per category */
function createCategoryIcon(category) {
  const colors = {
    Road:        '#f97316',
    Water:       '#3b82f6',
    Electricity: '#eab308',
    Garbage:     '#22c55e',
    Other:       '#8b5cf6',
  }
  const color = colors[category] || colors.Other
  return L.divIcon({
    className: '',
    html: `<div style="
      width:26px;height:26px;border-radius:50%;
      background:${color};border:3px solid rgba(255,255,255,0.9);
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
      display:flex;align-items:center;justify-content:center;
    "></div>`,
    iconSize:   [26, 26],
    iconAnchor: [13, 13],
    popupAnchor:[0, -15],
  })
}

/**
 * AuthorityMap — Leaflet map for the authority dashboard.
 * Only renders issues that have valid GPS coordinates.
 * Issues without coordinates are intentionally excluded to avoid misleading data.
 *
 * Architecture note: When coordinates become available in the future,
 * those issues will automatically appear on the map without any code changes.
 */
export default function AuthorityMap({ issues = [] }) {
  // Only plot issues with real GPS coordinates
  const mappableIssues = useMemo(
    () => issues.filter((i) => i.latitude && i.longitude),
    [issues]
  )

  // Compute default center from average of all points, or India center
  const center = useMemo(() => {
    if (!mappableIssues.length) return [20.5937, 78.9629] // India center
    const avgLat = mappableIssues.reduce((s, i) => s + parseFloat(i.latitude), 0) / mappableIssues.length
    const avgLon = mappableIssues.reduce((s, i) => s + parseFloat(i.longitude), 0) / mappableIssues.length
    return [avgLat, avgLon]
  }, [mappableIssues])

  return (
    <div className="card rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">Issue Map</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-300">{mappableIssues.length}</span> geo-tagged
          {issues.length - mappableIssues.length > 0 && (
            <span className="ml-1 text-slate-600">
              · {issues.length - mappableIssues.length} without location
            </span>
          )}
        </div>
      </div>

      {/* Category legend */}
      <div className="px-5 py-2.5 border-b border-white/[0.05] flex flex-wrap gap-3">
        {Object.entries({ Road: '#f97316', Water: '#3b82f6', Electricity: '#eab308', Garbage: '#22c55e', Other: '#8b5cf6' }).map(
          ([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
              {cat}
            </div>
          )
        )}
      </div>

      <div style={{ height: 420 }}>
        <MapContainer
          center={center}
          zoom={mappableIssues.length ? 12 : 5}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© OpenStreetMap contributors'
          />
          {mappableIssues.map((issue) => {
            const cat  = CATEGORY_INFO[issue.category] ?? CATEGORY_INFO.Other
            const icon = createCategoryIcon(issue.category)
            return (
              <Marker
                key={issue._id}
                position={[parseFloat(issue.latitude), parseFloat(issue.longitude)]}
                icon={icon}
              >
                <Popup className="civic-popup">
                  <div style={{ minWidth: 200, fontFamily: 'Inter, sans-serif' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}>{cat.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0' }}>
                        {issue.title}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: '#64748b', marginBottom: 6, lineHeight: 1.4 }}>
                      {issue.description?.slice(0, 80)}
                      {issue.description?.length > 80 ? '…' : ''}
                    </p>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {formatRelativeTime(issue.createdAt)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}
