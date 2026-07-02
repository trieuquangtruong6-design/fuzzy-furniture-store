import { apiClient } from './apiClient'
import type { Cart } from '../types/cart'

const cart = (response: { data: { data: { cart: Cart } } }) => response.data.data.cart

export const cartService = {
  async get() {
    return cart(await apiClient.get<{ data: { cart: Cart } }>('/api/cart'))
  },
  async add(productId: string, variantId: string, quantity: number) {
    return cart(await apiClient.post<{ data: { cart: Cart } }>('/api/cart/items', { productId, variantId, quantity }))
  },
  async update(itemId: string, quantity: number) {
    return cart(await apiClient.patch<{ data: { cart: Cart } }>(`/api/cart/items/${itemId}`, { quantity }))
  },
  async remove(itemId: string) {
    return cart(await apiClient.delete<{ data: { cart: Cart } }>(`/api/cart/items/${itemId}`))
  },
  async clear() {
    return cart(await apiClient.delete<{ data: { cart: Cart } }>('/api/cart'))
  },
}

