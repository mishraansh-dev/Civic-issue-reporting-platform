/**
 * severityPredictor.js — AI Service Stub
 *
 * Currently returns mock severity scores.
 * Future: Use Gemini Vision or a trained model to assess issue severity
 * from image content, category, and location density.
 *
 * @module services/ai/severityPredictor
 */

/** @typedef {{ severity: 'Low'|'Medium'|'High', score: number }} SeverityResult */

const SEVERITY_BY_CATEGORY = {
  Road:        { severity: 'High',   score: 0.82 },
  Water:       { severity: 'High',   score: 0.88 },
  Electricity: { severity: 'High',   score: 0.91 },
  Garbage:     { severity: 'Medium', score: 0.65 },
  Other:       { severity: 'Low',    score: 0.42 },
}

/**
 * Predict severity of an issue from image and category.
 * @param {File|Blob} _imageFile
 * @param {string} category - Issue category
 * @returns {Promise<SeverityResult>}
 */
export async function predictSeverity(_imageFile, category) {
  await new Promise((r) => setTimeout(r, 600))
  return SEVERITY_BY_CATEGORY[category] ?? { severity: 'Medium', score: 0.55 }
}
