import { apiClient } from './apiClient'
import type { Checkout } from '../types/checkout'

export const checkoutService = {
  async get() {
    const response = await apiClient.get<{ data: { checkout: Checkout } }>('/api/checkout')
    return response.data.data.checkout
  },
}

