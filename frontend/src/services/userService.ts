import { apiClient } from './apiClient'
import type { Address, AddressInput, User } from '../types/user'

export interface ProfileInput {
  fullName?: string
  phone?: string | null
  birthDate?: string | null
  avatarUrl?: string | null
}

export const userService = {
  async getProfile() {
    const response = await apiClient.get<{
      success: true
      data: { user: User }
    }>('/api/users/me')
    return response.data.data.user
  },

  async updateProfile(input: ProfileInput) {
    const response = await apiClient.patch<{
      success: true
      data: { user: User }
    }>('/api/users/me', input)
    return response.data.data.user
  },

  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await apiClient.post<{
      success: true
      data: { avatarUrl: string; user: User }
    }>('/api/users/me/avatar', formData)
    return response.data.data
  },

  async getAddresses() {
    const response = await apiClient.get<{
      success: true
      data: { addresses: Address[] }
    }>('/api/users/me/addresses')
    return response.data.data.addresses
  },

  async createAddress(input: AddressInput) {
    const response = await apiClient.post<{
      success: true
      data: { address: Address }
    }>('/api/users/me/addresses', input)
    return response.data.data.address
  },

  async updateAddress(id: string, input: Partial<AddressInput>) {
    const response = await apiClient.patch<{
      success: true
      data: { address: Address }
    }>(`/api/users/me/addresses/${id}`, input)
    return response.data.data.address
  },

  async deleteAddress(id: string) {
    await apiClient.delete(`/api/users/me/addresses/${id}`)
  },

  async setDefaultAddress(id: string) {
    const response = await apiClient.patch<{
      success: true
      data: { address: Address }
    }>(`/api/users/me/addresses/${id}/default`)
    return response.data.data.address
  },
}
