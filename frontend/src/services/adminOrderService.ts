import { apiClient } from './apiClient'
import type { AdminOrder } from '../types/adminOrder'
import type { OrderStatus } from '../types/order'

export const adminOrderService = {
  async list() {
    const response = await apiClient.get<{ data: { orders: AdminOrder[] } }>('/api/admin/orders')
    return response.data.data.orders
  },
  async detail(id: string) {
    const response = await apiClient.get<{ data: { order: AdminOrder } }>(`/api/admin/orders/${id}`)
    return response.data.data.order
  },
  async updateStatus(id: string, status: OrderStatus, note?: string) {
    const response = await apiClient.patch<{ data: { order: AdminOrder } }>(`/api/admin/orders/${id}/status`, { status, note: note || null })
    return response.data.data.order
  },
}

