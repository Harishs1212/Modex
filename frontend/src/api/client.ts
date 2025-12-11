import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Don't try to refresh token for login/register/refresh endpoints
    const isAuthEndpoint = originalRequest?.url?.includes('/users/login') ||
                          originalRequest?.url?.includes('/users/register') ||
                          originalRequest?.url?.includes('/users/refresh')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/users/refresh`, {
            refreshToken,
          })

          const { accessToken, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', accessToken)
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken)
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Clear tokens and redirect to login on refresh failure
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    // Better error handling for 400 errors
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.error || 'Bad Request'
      const errorDetails = error.response.data?.details || []
      
      // Create a more descriptive error message
      if (errorDetails.length > 0) {
        const details = errorDetails.map((d: any) => `${d.path}: ${d.message}`).join(', ')
        error.message = `${errorMessage} - ${details}`
      } else {
        error.message = errorMessage
      }
    }

    return Promise.reject(error)
  }
)

