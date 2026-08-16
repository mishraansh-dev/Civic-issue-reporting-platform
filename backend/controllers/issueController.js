const Issue = require('../models/Issue')
const { getIO } = require('../config/socket')

// ── Create Issue (User) ───────────────────────────────────────────────────────

const createIssue = async (req, res) => {
  try {
    const { title, description, category, locationText, latitude, longitude } = req.body
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null

    if (!title || !description || !category || !locationText) {
      return res.status(400).json({
        message: 'Title, description, category, and location are required.',
      })
    }

    const issue = await Issue.create({
      title: title.trim(),
      description: description.trim(),
      category,
      imageUrl,
      locationText: locationText.trim(),
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      userId: req.user.id,
    })

    const populated = await Issue.findById(issue._id).populate('userId', 'email')
    res.status(201).json(populated)
  } catch (err) {
    console.error('createIssue error:', err)
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors)[0].message })
    }
    res.status(500).json({ message: 'Failed to submit issue. Please try again.' })
  }
}

// ── Get My Issues (User) ──────────────────────────────────────────────────────

const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'email')
    res.json(issues)
  } catch (err) {
    console.error('getMyIssues error:', err)
    res.status(500).json({ message: 'Failed to fetch your issues.' })
  }
}

// ── Get All Issues (Authority) ────────────────────────────────────────────────
// Supports optional query params: ?category=Road&status=pending&search=keyword

const getAllIssues = async (req, res) => {
  try {
    const { category, status, search } = req.query
    const filter = {}

    if (category && category !== 'all') filter.category = category
    if (status && status !== 'all') filter.status = status
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { locationText: { $regex: search.trim(), $options: 'i' } },
      ]
    }

    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'email')
    res.json(issues)
  } catch (err) {
    console.error('getAllIssues error:', err)
    res.status(500).json({ message: 'Failed to fetch issues.' })
  }
}

// ── Update Status (Authority) ─────────────────────────────────────────────────

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['pending', 'in_progress', 'resolved']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be: pending, in_progress, or resolved.',
      })
    }

    const issue = await Issue.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('userId', 'email')

    if (!issue) return res.status(404).json({ message: 'Issue not found.' })

    // Emit real-time update to all connected socket clients
    try {
      const io = getIO()
      io.emit('issue:updated', { id: issue._id, status: issue.status })
    } catch (socketErr) {
      // Non-fatal: log but don't fail the request
      console.warn('Socket emit skipped:', socketErr.message)
    }

    res.json(issue)
  } catch (err) {
    console.error('updateStatus error:', err)
    res.status(500).json({ message: 'Failed to update status.' })
  }
}

// ── Get Statistics (Authority) ────────────────────────────────────────────────

const getStats = async (req, res) => {
  try {
    const [statusAgg, categoryAgg, total] = await Promise.all([
      Issue.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Issue.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Issue.countDocuments(),
    ])

    // Normalize into flat maps
    const byStatus = { pending: 0, in_progress: 0, resolved: 0 }
    statusAgg.forEach((s) => { byStatus[s._id] = s.count })

    const byCategory = {}
    categoryAgg.forEach((c) => { byCategory[c._id] = c.count })

    res.json({ total, byStatus, byCategory })
  } catch (err) {
    console.error('getStats error:', err)
    res.status(500).json({ message: 'Failed to fetch statistics.' })
  }
}

module.exports = { createIssue, getMyIssues, getAllIssues, updateStatus, getStats }
