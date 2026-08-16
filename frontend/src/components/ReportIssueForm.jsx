import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MapPin, Locate, Upload, X, FileImage, AlertCircle } from 'lucide-react'
import { issueAPI } from '../services/api'
import { CATEGORIES, CATEGORY_INFO } from '../utils/helpers'
import { cn } from '../utils/helpers'

/** Desktop: clickable category pill grid */
function CategoryPills({ value, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {CATEGORIES.map((cat) => {
        const info = CATEGORY_INFO[cat] ?? {}
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={cn('category-pill', value === cat && 'selected')}
            aria-pressed={value === cat}
          >
            <span className="text-xl leading-none">{info.icon}</span>
            <span className="leading-tight">{cat}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function ReportIssueForm({ onSuccess }) {
  const qc = useQueryClient()
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    locationText: '',
    latitude: '',
    longitude: '',
  })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const mutation = useMutation({
    mutationFn: (fd) => issueAPI.create(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-issues'] })
      toast.success('Issue reported successfully!')
      resetForm()
      if (onSuccess) onSuccess()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit issue')
    },
  })

  const resetForm = () => {
    setForm({ title: '', description: '', category: '', locationText: '', latitude: '', longitude: '' })
    setImage(null)
    setImagePreview(null)
    setFormError('')
  }

  const handleField = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleImage = (file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) handleImage(file)
  }

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported by your browser'); return }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setForm((f) => ({
          ...f,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          locationText: f.locationText || `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        }))
        toast.success('Location detected!')
        setGeoLoading(false)
      },
      () => {
        toast.error('Unable to detect location. Please enter manually.')
        setGeoLoading(false)
      }
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.title || !form.description || !form.category || !form.locationText) {
      setFormError('Please fill in all required fields.')
      return
    }
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v))
    if (image) fd.append('image', image)
    mutation.mutate(fd)
  }

  const label = 'block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error */}
      <AnimatePresence>
        {formError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
          >
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
            {formError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <div>
        <label className={label}>
          Title <span className="text-red-400 normal-case tracking-normal">*</span>
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleField}
          placeholder="Brief issue title…"
          maxLength={100}
          className="form-input"
          required
        />
        <p className="text-[11px] text-slate-600 mt-1 text-right tabular-nums">{form.title.length}/100</p>
      </div>

      {/* Category */}
      <div>
        <label className={label}>
          Category <span className="text-red-400 normal-case tracking-normal">*</span>
        </label>
        {/* Desktop: pill grid */}
        <div className="hidden sm:block">
          <CategoryPills value={form.category} onChange={(cat) => setForm((f) => ({ ...f, category: cat }))} />
        </div>
        {/* Mobile: select dropdown */}
        <div className="sm:hidden">
          <select
            name="category"
            value={form.category}
            onChange={handleField}
            className="form-input"
            required
          >
            <option value="">Select a category…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_INFO[c]?.icon} {c}</option>
            ))}
          </select>
        </div>
        {/* Hidden input so form.category is always correct */}
        <input type="hidden" name="category" value={form.category} readOnly />
      </div>

      {/* Description */}
      <div>
        <label className={label}>
          Description <span className="text-red-400 normal-case tracking-normal">*</span>
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleField}
          placeholder="Describe the issue in detail…"
          rows={4}
          maxLength={1000}
          className="form-input resize-none"
          required
        />
        <p className="text-[11px] text-slate-600 mt-1 text-right tabular-nums">{form.description.length}/1000</p>
      </div>

      {/* Location */}
      <div>
        <label className={label}>
          Location <span className="text-red-400 normal-case tracking-normal">*</span>
        </label>
        <div className="relative">
          <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            name="locationText"
            value={form.locationText}
            onChange={handleField}
            placeholder="e.g. MG Road near City Mall, Sector 5…"
            className="form-input pl-9 pr-32"
            required
          />
          <button
            type="button"
            onClick={detectLocation}
            disabled={geoLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
          >
            {geoLoading ? <div className="spinner w-3 h-3" /> : <Locate size={12} />}
            Auto-detect
          </button>
        </div>
        {form.latitude && (
          <p className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1">
            <MapPin size={10} /> GPS: {form.latitude}, {form.longitude}
          </p>
        )}
      </div>

      {/* Image Upload */}
      <div>
        <label className={label}>Photo (optional)</label>
        <AnimatePresence mode="wait">
          {imagePreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="relative rounded-xl overflow-hidden"
            >
              <img src={imagePreview} alt="Preview" className="w-full h-44 object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => { setImage(null); setImagePreview(null) }}
                className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center text-white transition-colors"
                aria-label="Remove image"
              >
                <X size={13} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/10 hover:border-indigo-500/40 rounded-xl p-8 text-center cursor-pointer transition-colors group"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
              aria-label="Upload image"
            >
              <FileImage size={26} className="mx-auto text-slate-600 group-hover:text-indigo-400 transition-colors mb-2" />
              <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">
                Drag & drop or <span className="text-indigo-400 font-medium">click to upload</span>
              </p>
              <p className="text-[11px] text-slate-600 mt-1">JPEG, PNG, WebP — max 5 MB</p>
            </motion.div>
          )}
        </AnimatePresence>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleImage(e.target.files?.[0])}
          className="hidden"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="btn-primary w-full py-3"
      >
        {mutation.isPending ? (
          <>
            <div className="spinner w-4 h-4" />
            Submitting…
          </>
        ) : (
          <>
            <Upload size={15} />
            Submit Issue Report
          </>
        )}
      </button>
    </form>
  )
}
