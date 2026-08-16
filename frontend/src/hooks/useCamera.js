import { useState, useRef, useCallback } from 'react'

/**
 * useCamera — MediaDevices API abstraction.
 *
 * Provides:
 * - openCamera(): Start video stream (rear cam on mobile, webcam on desktop)
 * - closeCamera(): Stop all tracks and clean up
 * - captureFrame(): Snapshot current video frame as a JPEG Blob
 * - isSupported: false on browsers without getUserMedia
 * - isOpen: whether the stream is active
 * - error: string | null
 *
 * @returns {{ videoRef, isSupported, isOpen, error, openCamera, closeCamera, captureFrame }}
 */
export function useCamera() {
  const videoRef  = useRef(null)
  const streamRef = useRef(null)

  const [isOpen,  setIsOpen]  = useState(false)
  const [error,   setError]   = useState(null)

  const isSupported = !!(navigator.mediaDevices?.getUserMedia)

  const openCamera = useCallback(async () => {
    if (!isSupported) {
      setError('Camera not supported by this browser.')
      return false
    }
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // rear cam on mobile
          width:  { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsOpen(true)
      return true
    } catch (err) {
      const msg =
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access.'
          : err.name === 'NotFoundError'
          ? 'No camera device found.'
          : err.message || 'Failed to open camera.'
      setError(msg)
      return false
    }
  }, [isSupported])

  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsOpen(false)
  }, [])

  const captureFrame = useCallback(() => {
    const video = videoRef.current
    if (!video || !isOpen) return Promise.resolve(null)

    const canvas = document.createElement('canvas')
    canvas.width  = video.videoWidth  || 1280
    canvas.height = video.videoHeight || 720

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
    })
  }, [isOpen])

  return { videoRef, isSupported, isOpen, error, openCamera, closeCamera, captureFrame }
}
