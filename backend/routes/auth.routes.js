const express = require('express')
const router = express.Router()
const { signup, login } = require('../controllers/authController')

// POST /api/auth/signup — Public, always creates role: "user"
router.post('/signup', signup)

// POST /api/auth/login — Public, works for both user and authority
router.post('/login', login)

module.exports = router
