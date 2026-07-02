import type { NextRequest } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth'
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response'
import { addCartItemSchema } from '@/modules/cart/cart.schema'
import { addCartItem } from '@/modules/cart/cart.service'

export async function POST(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(request)
    const parsed = addCartItemSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse('Dữ liệu giỏ hàng không hợp lệ.', 400, parsed.error.flatten().fieldErrors)
    return successResponse({ cart: await addCartItem(userId, parsed.data) }, 201)
  } catch (error) { return handleApiError(error) }
}

