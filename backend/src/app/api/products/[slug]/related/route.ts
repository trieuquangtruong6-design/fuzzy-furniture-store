import type { NextRequest } from 'next/server'

import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response'
import { productLimitQuerySchema } from '@/modules/products/product.schema'
import { listRelatedProducts } from '@/modules/products/product.service'

interface RelatedProductRouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(
  request: NextRequest,
  context: RelatedProductRouteContext,
) {
  try {
    const parsed = productLimitQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    )
    if (!parsed.success) {
      return errorResponse(
        'Tham số sản phẩm liên quan không hợp lệ.',
        400,
        parsed.error.flatten().fieldErrors,
      )
    }
    const { slug } = await context.params
    const products = await listRelatedProducts(slug, parsed.data.limit)
    return successResponse({ products })
  } catch (error) {
    return handleApiError(error)
  }
}
