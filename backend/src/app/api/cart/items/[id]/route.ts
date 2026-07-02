import type { NextRequest } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth'
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response'
import { updateCartItemSchema } from '@/modules/cart/cart.schema'
import { deleteCartItem, updateCartItem } from '@/modules/cart/cart.service'

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const userId = getAuthenticatedUserId(request)
    const parsed = updateCartItemSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse('Số lượng không hợp lệ.', 400, parsed.error.flatten().fieldErrors)
    const { id } = await context.params
    return successResponse({ cart: await updateCartItem(userId, id, parsed.data.quantity) })
  } catch (error) { return handleApiError(error) }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params
    return successResponse({ cart: await deleteCartItem(getAuthenticatedUserId(request), id) })
  } catch (error) { return handleApiError(error) }
}

