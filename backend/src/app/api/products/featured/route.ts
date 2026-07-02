import type { NextRequest } from 'next/server'

import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response'
import { productLimitQuerySchema } from '@/modules/products/product.schema'
import { listFeaturedProducts } from '@/modules/products/product.service'

export async function GET(request: NextRequest) {
  try {
    const parsed = productLimitQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    )
    if (!parsed.success) {
      return errorResponse(
        'Tham số sản phẩm nổi bật không hợp lệ.',
        400,
        parsed.error.flatten().fieldErrors,
      )
    }
    const products = await listFeaturedProducts(parsed.data.limit)
    return successResponse({ products })
  } catch (error) {
    return handleApiError(error)
  }
}
