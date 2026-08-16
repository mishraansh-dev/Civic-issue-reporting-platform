import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { AuthProvider } from './hooks/useAuth'
import { ProtectedRoute, AuthorityRoute } from './components/ProtectedRoute'

import Login from './pages/Login'
import Signup from './pages/Signup'
import UserDashboard from './pages/UserDashboard'
import ReportIssuePage from './pages/ReportIssuePage'
import AuthorityDashboard from './pages/AuthorityDashboard'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* ── Public ────────────────────────────────── */}
            <Route path="/login"  element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* ── Protected: Citizen ────────────────────── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/report"    element={<ReportIssuePage />} />
            </Route>

            {/* ── Protected: Authority ONLY ─────────────── */}
            <Route element={<AuthorityRoute />}>
              <Route path="/admin" element={<AuthorityDashboard />} />
            </Route>

            {/* ── Fallback ──────────────────────────────── */}
            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>

        <Toaster
          position="top-right"
          theme="dark"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}
