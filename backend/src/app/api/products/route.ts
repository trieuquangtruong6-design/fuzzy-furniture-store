import type { NextRequest } from 'next/server'

import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response'
import { productListQuerySchema } from '@/modules/products/product.schema'
import { listPublicProducts } from '@/modules/products/product.service'

export async function GET(request: NextRequest) {
  try {
    const parsed = productListQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    )
    if (!parsed.success) {
      return errorResponse(
        'Tham số danh sách sản phẩm không hợp lệ.',
        400,
        parsed.error.flatten().fieldErrors,
      )
    }
    return successResponse(await listPublicProducts(parsed.data))
  } catch (error) {
    return handleApiError(error)
  }
}
