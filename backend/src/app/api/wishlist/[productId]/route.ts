import type { NextRequest } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-response'
import { removeWishlistItem } from '@/modules/wishlist/wishlist.service'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> },
) {
  try {
    const { productId } = await context.params
    return successResponse({
      wishlist: await removeWishlistItem(getAuthenticatedUserId(request), productId),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
