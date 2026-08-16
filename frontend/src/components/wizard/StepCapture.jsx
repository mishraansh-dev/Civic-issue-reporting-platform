import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, X, RefreshCw, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { useCamera } from '../../hooks/useCamera'
import { compressImage, blobToFile } from '../../utils/imageCompression'
import { toast } from 'sonner'

/**
 * StepCapture — Step 1 of the Report Wizard.
 * Provides two paths: Open Camera (rear cam on mobile) or Upload from Gallery.
 * Compresses the captured/selected image before passing it up.
 */
export default function StepCapture({ onCapture }) {
  const { videoRef, isSupported, isOpen, error: cameraError, openCamera, closeCamera, captureFrame } = useCamera()
  const fileRef     = useRef(null)
  const [preview, setPreview]     = useState(null)   // data-URL for preview
  const [imgFile, setImgFile]     = useState(null)   // compressed File
  const [compressing, setCompressing] = useState(false)
  const [showCamera, setShowCamera]   = useState(false)

  /* ── Open camera ── */
  const handleOpenCamera = async () => {
    setShowCamera(true)
    const ok = await openCamera()
    if (!ok) setShowCamera(false)
  }

  /* ── Capture frame ── */
  const handleCapture = async () => {
    const blob = await captureFrame()
    if (!blob) return
    closeCamera()
    setShowCamera(false)
    await processFile(blobToFile(blob))
  }

  /* ── Gallery upload ── */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    await processFile(file)
    e.target.value = ''
  }

  /* ── Compress + preview ── */
  const processFile = async (file) => {
    if (file.size > 20 * 1024 * 1024) { toast.error('File too large. Max 20 MB.'); return }
    setCompressing(true)
    try {
      const compressed = await compressImage(file)
      const url = URL.createObjectURL(compressed)
      setPreview(url)
      setImgFile(compressed)
    } catch {
      toast.error('Failed to process image.')
    } finally {
      setCompressing(false)
    }
  }

  /* ── Retake ── */
  const handleRetake = () => {
    setPreview(null)
    setImgFile(null)
  }

  /* ── Continue ── */
  const handleContinue = () => {
    if (imgFile) onCapture(imgFile, preview)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <p className="text-slate-400 text-sm">Take a photo of the civic issue or upload one from your device.</p>
      </div>

      {/* Live camera viewfinder */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full relative rounded-2xl overflow-hidden bg-black border border-white/10"
            style={{ maxHeight: 360 }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full object-cover"
              style={{ maxHeight: 360 }}
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-4 pb-5 pt-8"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}
            >
              {/* Cancel */}
              <button
                onClick={() => { closeCamera(); setShowCamera(false) }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Cancel"
              >
                <X size={18} />
              </button>
              {/* Shutter */}
              <button
                onClick={handleCapture}
                className="w-16 h-16 rounded-full bg-white hover:bg-white/90 flex items-center justify-center transition-colors shadow-lg"
                aria-label="Capture"
              >
                <div className="w-12 h-12 rounded-full border-2 border-slate-400" />
              </button>
              <div className="w-10 h-10" /> {/* spacer */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera error */}
      {cameraError && (
        <div className="w-full flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
          {cameraError}
        </div>
      )}

      {/* Image preview */}
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={preview} alt="Captured" className="w-full object-cover" style={{ maxHeight: 300 }} />
              <button
                onClick={handleRetake}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs font-medium transition-colors"
              >
                <RefreshCw size={12} /> Retake
              </button>
            </div>
            <button
              onClick={handleContinue}
              className="btn-primary w-full py-3 mt-4"
            >
              Continue →
            </button>
          </motion.div>
        ) : !showCamera ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col sm:flex-row gap-3 w-full"
          >
            {/* Open Camera */}
            <button
              onClick={handleOpenCamera}
              disabled={compressing}
              className="flex-1 flex flex-col items-center gap-2.5 py-6 rounded-2xl border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group cursor-pointer"
            >
              <Camera size={28} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-300 group-hover:text-slate-100">Open Camera</p>
                <p className="text-xs text-slate-600 mt-0.5">Rear camera on mobile</p>
              </div>
            </button>

            {/* Upload from Gallery */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={compressing}
              className="flex-1 flex flex-col items-center gap-2.5 py-6 rounded-2xl border border-white/10 hover:border-slate-500/40 hover:bg-white/[0.03] transition-all group cursor-pointer"
            >
              {compressing ? (
                <div className="spinner w-7 h-7" />
              ) : (
                <ImageIcon size={28} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
              )}
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-300 group-hover:text-slate-100">
                  {compressing ? 'Compressing…' : 'Upload from Gallery'}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">JPEG, PNG, WebP — max 20 MB</p>
              </div>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  )
}
