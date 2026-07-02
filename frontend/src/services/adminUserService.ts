import { apiClient } from './apiClient'
import type { AdminUser } from '../types/adminUser'

export const adminUserService = {
  async list() {
    const response = await apiClient.get<{ data: { users: AdminUser[] } }>('/api/admin/users')
    return response.data.data.users
  },
  async update(id: string, input: { role?: 'USER' | 'ADMIN'; isActive?: boolean }) {
    const response = await apiClient.patch<{ data: { user: AdminUser } }>(
      `/api/admin/users/${id}`,
      input,
    )
    return response.data.data.user
  },
}
