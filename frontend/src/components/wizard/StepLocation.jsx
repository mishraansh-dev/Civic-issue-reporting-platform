import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Locate, Edit3, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useGeolocation } from '../../hooks/useGeolocation'
import LocationMapPreview from '../map/LocationMapPreview'

/**
 * StepLocation — Step 2 of the Report Wizard.
 * Auto-detects location on mount, shows Nominatim address + draggable map.
 * Falls back to manual input on permission denial or error.
 */
export default function StepLocation({ onLocation }) {
  const { location, loading, error, detect, setLocation } = useGeolocation()
  const [manualText, setManualText] = useState('')
  const [editMode, setEditMode]     = useState(false)
  const [displayText, setDisplayText] = useState('')

  // Auto-detect on mount
  useEffect(() => {
    detect()
  }, []) // eslint-disable-line

  // Sync displayText when location changes
  useEffect(() => {
    if (location?.displayName) {
      setDisplayText(location.displayName)
    }
  }, [location])

  const handleDrag = (lat, lon) => {
    setLocation((prev) => ({ ...prev, lat, lon }))
  }

  const handleContinue = () => {
    if (location) {
      onLocation({
        latitude:     location.lat.toFixed(6),
        longitude:    location.lon.toFixed(6),
        locationText: editMode ? manualText : (displayText || location.displayName),
      })
    } else {
      // Manual entry — no GPS
      onLocation({ latitude: '', longitude: '', locationText: manualText })
    }
  }

  const canContinue = location || manualText.trim().length > 3

  return (
    <div className="flex flex-col gap-5">
      <p className="text-slate-400 text-sm text-center">
        We'll pin the issue on the map so authorities can reach it quickly.
      </p>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl card"
          >
            <div className="spinner w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm text-slate-300 font-medium">Detecting your location…</p>
              <p className="text-xs text-slate-500 mt-0.5">Using GPS and OpenStreetMap</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state — permission denied → manual only */}
      <AnimatePresence>
        {error && !location && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm"
          >
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Location access denied</p>
              <p className="text-xs text-amber-400/70 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location detected — show address + map */}
      <AnimatePresence>
        {location && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Confirmed address */}
            {!editMode ? (
              <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl card">
                <div className="flex items-start gap-2.5 min-w-0">
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-200 leading-relaxed line-clamp-3">{displayText}</p>
                </div>
                <button
                  onClick={() => { setEditMode(true); setManualText(displayText) }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex-shrink-0 flex items-center gap-1 transition-colors"
                >
                  <Edit3 size={12} /> Edit
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Edit Location
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    className="form-input pl-9"
                    placeholder="Type your location…"
                  />
                </div>
              </div>
            )}

            {/* Map preview */}
            <LocationMapPreview
              lat={location.lat}
              lon={location.lon}
              onDrag={handleDrag}
            />
            <p className="text-[11px] text-slate-600 text-center">
              Drag the marker to adjust the exact position.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual entry (no GPS) */}
      {!loading && !location && (
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            Enter Location Manually
          </label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="form-input pl-9"
              placeholder="e.g. MG Road, near City Mall, Sector 5…"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Re-detect button */}
      {!loading && !location && (
        <button
          onClick={detect}
          className="btn-secondary py-2.5 text-sm"
        >
          <Locate size={14} /> Try Again
        </button>
      )}

      {/* Continue */}
      <button
        onClick={handleContinue}
        disabled={!canContinue || loading}
        className="btn-primary w-full py-3"
      >
        Continue →
      </button>

      {/* Skip */}
      {!location && (
        <button
          onClick={() => onLocation({ latitude: '', longitude: '', locationText: manualText || 'Location not specified' })}
          className="text-xs text-slate-600 hover:text-slate-400 text-center transition-colors"
        >
          Skip — enter location later
        </button>
      )}
    </div>
  )
}
