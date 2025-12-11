import { apiClient } from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  address?: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    role: string
  }
  accessToken: string
  refreshToken: string
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/users/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<{ user: AuthResponse['user'] }> => {
    const response = await apiClient.post('/users/register', data)
    return response.data
  },

  getProfile: async () => {
    const response = await apiClient.get('/users/profile')
    return response.data
  },
}

