/**
 * imageCompression.js
 * Wrapper around browser-image-compression with sensible defaults for
 * civic issue photo uploads. Falls back to the original file on error.
 */
import imageCompression from 'browser-image-compression'

const DEFAULT_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1280,
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.85,
}

/**
 * Compress an image file before upload.
 * @param {File|Blob} file
 * @param {object} [overrides] - Override compression options
 * @returns {Promise<File>}
 */
export async function compressImage(file, overrides = {}) {
  try {
    const opts = { ...DEFAULT_OPTIONS, ...overrides }
    const compressed = await imageCompression(file, opts)
    return compressed
  } catch (err) {
    console.warn('[imageCompression] Compression failed, using original:', err.message)
    return file
  }
}

/**
 * Convert a Blob (from camera capture) to a named File.
 * @param {Blob} blob
 * @param {string} [filename]
 * @returns {File}
 */
export function blobToFile(blob, filename = `capture-${Date.now()}.jpg`) {
  return new File([blob], filename, { type: blob.type || 'image/jpeg' })
}
