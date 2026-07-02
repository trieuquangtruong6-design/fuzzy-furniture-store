import type { NextRequest } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth'
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response'
import { createOrderSchema, idempotencyKeySchema } from '@/modules/orders/order.schema'
import { createOrder, listUserOrders } from '@/modules/orders/order.service'

export async function GET(request: NextRequest) {
  try {
    return successResponse({ orders: await listUserOrders(getAuthenticatedUserId(request)) })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(request)
    const key = idempotencyKeySchema.safeParse(request.headers.get('idempotency-key'))
    if (!key.success) return errorResponse('Idempotency-Key không hợp lệ.', 400)
    const parsed = createOrderSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return errorResponse('Dữ liệu đặt hàng không hợp lệ.', 400, parsed.error.flatten().fieldErrors)
    }
    const result = await createOrder(userId, key.data, parsed.data)
    return successResponse(result, result.replayed ? 200 : 201)
  } catch (error) {
    return handleApiError(error)
  }
}
