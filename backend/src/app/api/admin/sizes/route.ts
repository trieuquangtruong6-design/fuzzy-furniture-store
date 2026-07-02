import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response'
import { createSizeSchema } from '@/modules/admin-products/admin-product.schema'
import { createSize, listSizes } from '@/modules/admin-products/admin-product.service'

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); return successResponse({ sizes: await listSizes() }) }
  catch (error) { return handleApiError(error) }
}
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const parsed = createSizeSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse('Dữ liệu kích cỡ không hợp lệ.', 400, parsed.error.flatten().fieldErrors)
    return successResponse({ size: await createSize(parsed.data) }, 201)
  } catch (error) { return handleApiError(error) }
}
