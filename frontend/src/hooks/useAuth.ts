import { useState, useEffect } from 'react'
import { authApi } from '../api/auth.api'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      loadUser()
    } else {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUser = async () => {
    try {
      setIsLoading(true)
      const profile = await authApi.getProfile()
      setUser(profile)
    } catch (error) {
      console.error('Failed to load user profile:', error)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
    // Update user state immediately - React will batch this
    setUser(response.user)
    return response
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  return {
    user,
    isLoading,
    login,
    logout,
    loadUser,
  }
}

