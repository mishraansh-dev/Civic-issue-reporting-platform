/**
 * duplicateDetector.js — AI Service Stub
 *
 * Currently returns mock duplicate detection results.
 * Future: Query a geo-spatial index of existing issues within a radius
 * of the provided coordinates and return similar reports.
 *
 * @module services/ai/duplicateDetector
 */

/** @typedef {{ duplicatesNearby: number, nearestDistanceM: number|null }} DuplicateResult */

/**
 * Detect duplicate reports near a given location.
 * @param {number|null} _lat  - Latitude (unused in mock)
 * @param {number|null} _lon  - Longitude (unused in mock)
 * @returns {Promise<DuplicateResult>}
 */
export async function detectDuplicates(_lat, _lon) {
  await new Promise((r) => setTimeout(r, 500))
  // Mock: no duplicates found nearby
  return { duplicatesNearby: 0, nearestDistanceM: null }
}
