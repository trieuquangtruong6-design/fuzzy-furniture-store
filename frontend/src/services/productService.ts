import { apiClient } from './apiClient'
import type { Category, ProductCard, ProductDetail } from '../types/product'

export const productService = {
  async categories() {
    const response = await apiClient.get<{ data: { categories: Category[] } }>('/api/categories')
    return response.data.data.categories
  },
  async products(params: Record<string, string | number | undefined>) {
    const response = await apiClient.get<{ data: {
      products: ProductCard[]
      pageInfo: { nextCursor: string | null; hasMore: boolean }
    } }>('/api/products', { params })
    return response.data.data
  },
  async featured(limit = 8) {
    const response = await apiClient.get<{ data: { products: ProductCard[] } }>('/api/products/featured', { params: { limit } })
    return response.data.data.products
  },
  async detail(slug: string) {
    const response = await apiClient.get<{ data: { product: ProductDetail } }>(`/api/products/${slug}`)
    return response.data.data.product
  },
  async related(slug: string) {
    const response = await apiClient.get<{ data: { products: ProductCard[] } }>(`/api/products/${slug}/related`)
    return response.data.data.products
  },
}
