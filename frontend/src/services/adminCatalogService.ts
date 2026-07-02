import { apiClient } from './apiClient'
import type { AdminCategory, AdminColor, AdminImage, AdminProduct, AdminSize, AdminVariant } from '../types/admin'

const data = <T>(response: { data: { data: T } }) => response.data.data

export const adminCatalogService = {
  async products() {
    return data((await apiClient.get<{ data: { products: AdminProduct[] } }>('/api/admin/products'))).products
  },
  async createProduct(input: unknown) {
    return data((await apiClient.post<{ data: { product: AdminProduct } }>('/api/admin/products', input))).product
  },
  async updateProduct(id: string, input: unknown) {
    return data((await apiClient.patch<{ data: { product: AdminProduct } }>(`/api/admin/products/${id}`, input))).product
  },
  async deleteProduct(id: string) { await apiClient.delete(`/api/admin/products/${id}`) },
  async addImage(productId: string, input: unknown) {
    return data((await apiClient.post<{ data: { image: AdminImage } }>(`/api/admin/products/${productId}/images`, input))).image
  },
  async deleteImage(productId: string, id: string) { await apiClient.delete(`/api/admin/products/${productId}/images/${id}`) },
  async addVariant(productId: string, input: unknown) {
    return data((await apiClient.post<{ data: { variant: AdminVariant } }>(`/api/admin/products/${productId}/variants`, input))).variant
  },
  async updateVariant(productId: string, id: string, input: unknown) {
    return data((await apiClient.patch<{ data: { variant: AdminVariant } }>(`/api/admin/products/${productId}/variants/${id}`, input))).variant
  },
  async deleteVariant(productId: string, id: string) { await apiClient.delete(`/api/admin/products/${productId}/variants/${id}`) },
  async categories() {
    return data((await apiClient.get<{ data: { categories: AdminCategory[] } }>('/api/admin/categories'))).categories
  },
  async createCategory(input: unknown) {
    return data((await apiClient.post<{ data: { category: AdminCategory } }>('/api/admin/categories', input))).category
  },
  async updateCategory(id: string, input: unknown) {
    return data((await apiClient.patch<{ data: { category: AdminCategory } }>(`/api/admin/categories/${id}`, input))).category
  },
  async deleteCategory(id: string) { await apiClient.delete(`/api/admin/categories/${id}`) },
  async colors() {
    return data((await apiClient.get<{ data: { colors: AdminColor[] } }>('/api/admin/colors'))).colors
  },
  async createColor(input: unknown) {
    return data((await apiClient.post<{ data: { color: AdminColor } }>('/api/admin/colors', input))).color
  },
  async updateColor(id: string, input: unknown) {
    return data((await apiClient.patch<{ data: { color: AdminColor } }>(`/api/admin/colors/${id}`, input))).color
  },
  async deleteColor(id: string) { await apiClient.delete(`/api/admin/colors/${id}`) },
  async sizes() {
    return data((await apiClient.get<{ data: { sizes: AdminSize[] } }>('/api/admin/sizes'))).sizes
  },
  async createSize(input: unknown) {
    return data((await apiClient.post<{ data: { size: AdminSize } }>('/api/admin/sizes', input))).size
  },
  async updateSize(id: string, input: unknown) {
    return data((await apiClient.patch<{ data: { size: AdminSize } }>(`/api/admin/sizes/${id}`, input))).size
  },
  async deleteSize(id: string) { await apiClient.delete(`/api/admin/sizes/${id}`) },
}
