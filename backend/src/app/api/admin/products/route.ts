import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response'
import { createProductSchema } from '@/modules/admin-products/admin-product.schema'
import { createAdminProduct, listAdminProducts } from '@/modules/admin-products/admin-product.service'

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); return successResponse({ products: await listAdminProducts() }) }
  catch (error) { return handleApiError(error) }
}
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const parsed = createProductSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse('Dữ liệu sản phẩm không hợp lệ.', 400, parsed.error.flatten().fieldErrors)
    return successResponse({ product: await createAdminProduct(parsed.data) }, 201)
  } catch (error) { return handleApiError(error) }
}
