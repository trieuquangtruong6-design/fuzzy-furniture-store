import { apiClient } from './apiClient'
import type { CreateOrderResult, PaymentMethod } from '../types/order'

export const orderService = {
  async list() {
    const response = await apiClient.get<{ data: { orders: import('../types/order').CreatedOrder[] } }>('/api/orders')
    return response.data.data.orders
  },
  async detail(orderCode: string) {
    const response = await apiClient.get<{ data: { order: import('../types/order').CreatedOrder } }>(`/api/orders/${orderCode}`)
    return response.data.data.order
  },
  async cancel(orderCode: string) {
    const response = await apiClient.patch<{ data: { order: import('../types/order').CreatedOrder } }>(`/api/orders/${orderCode}/cancel`)
    return response.data.data.order
  },
  async create(input: {
    addressId: string
    paymentMethod: PaymentMethod
    note?: string | null
    idempotencyKey: string
  }) {
    const { idempotencyKey, ...body } = input
    const response = await apiClient.post<{ data: CreateOrderResult }>('/api/orders', body, {
      headers: { 'Idempotency-Key': idempotencyKey },
    })
    return response.data.data
  },
}
