import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response'
import { updateColorSchema } from '@/modules/admin-products/admin-product.schema'
import { deleteColor, updateColor } from '@/modules/admin-products/admin-product.service'

interface Context { params: Promise<{ id: string }> }
export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requireAdmin(request)
    const parsed = updateColorSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse('Dữ liệu màu không hợp lệ.', 400, parsed.error.flatten().fieldErrors)
    return successResponse({ color: await updateColor((await context.params).id, parsed.data) })
  } catch (error) { return handleApiError(error) }
}
export async function DELETE(request: NextRequest, context: Context) {
  try { await requireAdmin(request); return successResponse(await deleteColor((await context.params).id)) }
  catch (error) { return handleApiError(error) }
}
