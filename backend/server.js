require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')
const http = require('http')
const fs = require('fs')

const connectDB = require('./config/db')
const { initSocket } = require('./config/socket')
const authRoutes = require('./routes/auth.routes')
const issueRoutes = require('./routes/issue.routes')

// ── Bootstrap ────────────────────────────────────────────────────────────────

connectDB()

const app = express()
const httpServer = http.createServer(app)

// Initialize Socket.io (must happen before any route handlers import getIO())
initSocket(httpServer)

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// ── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded images
app.use('/uploads', express.static(uploadsDir))

// ── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes)
app.use('/api/issues', issueRoutes)

// Health check
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
)

// ── Global Error Handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message)
  const status = err.status || 500
  res.status(status).json({ message: err.message || 'Internal server error' })
})

// ── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`)
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🗄️  MongoDB URI:  ${process.env.MONGODB_URI}\n`)
})
