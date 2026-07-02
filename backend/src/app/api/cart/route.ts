import type { NextRequest } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-response'
import { clearCart, getCart } from '@/modules/cart/cart.service'

export async function GET(request: NextRequest) {
  try {
    return successResponse({ cart: await getCart(getAuthenticatedUserId(request)) })
  } catch (error) { return handleApiError(error) }
}

export async function DELETE(request: NextRequest) {
  try {
    return successResponse({ cart: await clearCart(getAuthenticatedUserId(request)) })
  } catch (error) { return handleApiError(error) }
}

