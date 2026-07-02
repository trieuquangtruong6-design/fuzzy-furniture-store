import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response'
import { createColorSchema } from '@/modules/admin-products/admin-product.schema'
import { createColor, listColors } from '@/modules/admin-products/admin-product.service'

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); return successResponse({ colors: await listColors() }) }
  catch (error) { return handleApiError(error) }
}
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const parsed = createColorSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse('Dữ liệu màu không hợp lệ.', 400, parsed.error.flatten().fieldErrors)
    return successResponse({ color: await createColor(parsed.data) }, 201)
  } catch (error) { return handleApiError(error) }
}
