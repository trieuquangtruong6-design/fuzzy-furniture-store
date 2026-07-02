import { apiClient } from './apiClient'
import type { User } from '../types/user'

interface UserResponse {
  success: true
  data: { user: User }
}

export const authService = {
  async register(input: {
    fullName: string
    email: string
    password: string
  }) {
    const response = await apiClient.post<UserResponse>('/api/auth/register', input)
    return response.data.data.user
  },

  async login(input: { email: string; password: string }) {
    const response = await apiClient.post<UserResponse>('/api/auth/login', input)
    return response.data.data.user
  },

  async logout() {
    await apiClient.post('/api/auth/logout')
  },

  async me() {
    const response = await apiClient.get<UserResponse>('/api/auth/me')
    return response.data.data.user
  },
}
