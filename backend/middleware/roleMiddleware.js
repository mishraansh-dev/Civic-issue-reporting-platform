/**
 * roleMiddleware — Ensures the authenticated user has role === "authority".
 * Must be used AFTER authMiddleware.
 * Returns 403 Forbidden for any other role (including regular "user").
 */
const roleMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  if (req.user.role !== 'authority') {
    return res.status(403).json({
      message: 'Access denied. This endpoint requires authority-level access.',
    })
  }

  next()
}

module.exports = roleMiddleware
