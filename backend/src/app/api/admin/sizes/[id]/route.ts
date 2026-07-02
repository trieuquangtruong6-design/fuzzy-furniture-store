import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response'
import { updateSizeSchema } from '@/modules/admin-products/admin-product.schema'
import { deleteSize, updateSize } from '@/modules/admin-products/admin-product.service'

interface Context { params: Promise<{ id: string }> }
export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requireAdmin(request)
    const parsed = updateSizeSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse('Dữ liệu kích cỡ không hợp lệ.', 400, parsed.error.flatten().fieldErrors)
    return successResponse({ size: await updateSize((await context.params).id, parsed.data) })
  } catch (error) { return handleApiError(error) }
}
export async function DELETE(request: NextRequest, context: Context) {
  try { await requireAdmin(request); return successResponse(await deleteSize((await context.params).id)) }
  catch (error) { return handleApiError(error) }
}
