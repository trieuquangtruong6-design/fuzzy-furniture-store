import type { NextRequest } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response'
import { addWishlistItemSchema } from '@/modules/wishlist/wishlist.schema'
import { addWishlistItem, getWishlist } from '@/modules/wishlist/wishlist.service'

export async function GET(request: NextRequest) {
  try {
    return successResponse({ wishlist: await getWishlist(getAuthenticatedUserId(request)) })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(request)
    const parsed = addWishlistItemSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return errorResponse('Dữ liệu wishlist không hợp lệ.', 400, parsed.error.flatten().fieldErrors)
    }
    return successResponse(
      { wishlist: await addWishlistItem(userId, parsed.data.productId) },
      201,
    )
  } catch (error) {
    return handleApiError(error)
  }
}
