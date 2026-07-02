import { apiClient } from './apiClient'
import type { Wishlist } from '../types/wishlist'

interface WishlistResponse {
  success: true
  data: { wishlist: Wishlist }
}

export const wishlistService = {
  async get() {
    const response = await apiClient.get<WishlistResponse>('/api/wishlist')
    return response.data.data.wishlist
  },
  async add(productId: string) {
    const response = await apiClient.post<WishlistResponse>('/api/wishlist', { productId })
    return response.data.data.wishlist
  },
  async remove(productId: string) {
    const response = await apiClient.delete<WishlistResponse>(`/api/wishlist/${productId}`)
    return response.data.data.wishlist
  },
}
