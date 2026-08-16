/**
 * imageClassifier.js — AI Service Stub
 *
 * Currently returns mock data.
 * Architecture is ready for Gemini Vision integration:
 *
 *   import { GoogleGenerativeAI } from '@google/generative-ai'
 *   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
 *   const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
 *   const result = await model.generateContent([prompt, { inlineData: ... }])
 *
 * @module services/ai/imageClassifier
 */

/** @typedef {{ isCivicIssue: boolean, category: string, confidence: number }} ClassificationResult */

const MOCK_RESULTS = [
  { isCivicIssue: true,  category: 'Garbage',     confidence: 0.91 },
  { isCivicIssue: true,  category: 'Road',         confidence: 0.87 },
  { isCivicIssue: true,  category: 'Water',        confidence: 0.82 },
  { isCivicIssue: true,  category: 'Electricity',  confidence: 0.78 },
  { isCivicIssue: true,  category: 'Other',        confidence: 0.74 },
]

/**
 * Classify an image to detect civic issue category.
 * @param {File|Blob} _imageFile - The image to analyse (unused in mock)
 * @returns {Promise<ClassificationResult>}
 */
export async function classifyImage(_imageFile) {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 900))
  // Return a deterministic mock (rotate through results for demo variety)
  return MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)]
}
