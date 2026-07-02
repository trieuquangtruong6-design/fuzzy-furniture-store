import type { NextRequest } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-response'
import { cancelUserOrder } from '@/modules/orders/order.service'

type Context = { params: Promise<{ orderCode: string }> }

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const { orderCode } = await context.params
    return successResponse({ order: await cancelUserOrder(getAuthenticatedUserId(request), orderCode) })
  } catch (error) {
    return handleApiError(error)
  }
}

