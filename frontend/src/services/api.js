import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({ baseURL: BASE_URL })

// ── Request interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor — handle 401 ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
}

// ── Issues ───────────────────────────────────────────────────────────────────
export const issueAPI = {
  /** Create issue with optional image (FormData) */
  create: (formData) =>
    api.post('/api/issues', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** Get issues belonging to the logged-in user */
  getMyIssues: () => api.get('/api/issues/my'),

  /** [Authority] Get all issues with optional filters */
  getAllIssues: (params) => api.get('/api/issues', { params }),

  /** [Authority] Update an issue's status */
  updateStatus: (id, status) => api.patch(`/api/issues/${id}/status`, { status }),

  /** [Authority] Get aggregated statistics */
  getStats: () => api.get('/api/issues/stats'),
}

export default api
