const User = require('../models/User')
const jwt = require('jsonwebtoken')

// ── Helpers ──────────────────────────────────────────────────────────────────

const generateToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

// ── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/signup
 * Creates a new citizen account. Role is ALWAYS "user" — authority accounts
 * can ONLY be created via the seed script.
 */
const signup = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'This email is already registered.' })
    }

    // ⚠️  SECURITY: role is hardcoded to "user" — no override possible via API
    const user = await User.create({ email, password, role: 'user' })
    const token = generateToken(user)

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error('Signup error:', err)
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This email is already registered.' })
    }
    res.status(500).json({ message: 'Failed to create account. Please try again.' })
  }
}

/**
 * POST /api/auth/login
 * Authenticates any user (citizen or authority) and returns a JWT.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const token = generateToken(user)

    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Login failed. Please try again.' })
  }
}

module.exports = { signup, login }
