const express = require('express')
const path = require('path')
const multer = require('multer')
const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const {
  createIssue,
  getMyIssues,
  getAllIssues,
  updateStatus,
  getStats,
} = require('../controllers/issueController')

// ── Multer setup (local storage, 5 MB limit, images only) ────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `issue-${unique}${path.extname(file.originalname)}`)
  },
})

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase())
  const mimeOk = allowed.test(file.mimetype)
  extOk && mimeOk ? cb(null, true) : cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP).'))
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })

// ── User Routes (authenticated, any role) ────────────────────────────────────

// POST /api/issues — Submit a new issue with optional image
router.post('/', authMiddleware, upload.single('image'), createIssue)

// GET /api/issues/my — Fetch issues belonging to the logged-in user
router.get('/my', authMiddleware, getMyIssues)

// ── Authority Routes (authenticated + authority role ONLY) ───────────────────

// GET /api/issues/stats — Issue statistics (total, by status, by category)
router.get('/stats', authMiddleware, roleMiddleware, getStats)

// GET /api/issues — All issues with optional ?category & ?status filters
router.get('/', authMiddleware, roleMiddleware, getAllIssues)

// PATCH /api/issues/:id/status — Update a single issue's status
router.patch('/:id/status', authMiddleware, roleMiddleware, updateStatus)

module.exports = router
