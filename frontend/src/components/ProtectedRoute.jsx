import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * ProtectedRoute — Blocks unauthenticated users.
 * Redirects to /login if no valid session.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

/**
 * AuthorityRoute — Blocks anyone who isn't an authority.
 * Unauthenticated → /login
 * Authenticated but role !== "authority" → /dashboard
 */
export function AuthorityRoute() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'authority') return <Navigate to="/dashboard" replace />
  return <Outlet />
}
