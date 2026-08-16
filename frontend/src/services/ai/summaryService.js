/**
 * summaryService.js — AI Service Stub
 *
 * Currently returns mock resolution estimates.
 * Future: Use an LLM (e.g. Gemini Pro) to generate a resolution summary
 * based on category, severity, historical resolution times, and location data.
 *
 * @module services/ai/summaryService
 */

/** @typedef {{ estimatedHours: string, priority: string }} ResolutionEstimate */

const ESTIMATES_BY_CATEGORY = {
  Road:        { estimatedHours: '48–72 hours', priority: 'High' },
  Water:       { estimatedHours: '24–48 hours', priority: 'Critical' },
  Electricity: { estimatedHours: '12–24 hours', priority: 'Critical' },
  Garbage:     { estimatedHours: '24–48 hours', priority: 'Medium' },
  Other:       { estimatedHours: '3–5 days',    priority: 'Low' },
}

/**
 * Estimate resolution time for an issue.
 * @param {string} category - Issue category
 * @returns {Promise<ResolutionEstimate>}
 */
export async function estimateResolution(category) {
  await new Promise((r) => setTimeout(r, 400))
  return ESTIMATES_BY_CATEGORY[category] ?? { estimatedHours: '48–72 hours', priority: 'Medium' }
}
