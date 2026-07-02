import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response'
import { updateImageSchema } from '@/modules/admin-products/admin-product.schema'
import { deleteProductImage, updateProductImage } from '@/modules/admin-products/admin-product.service'

interface Context { params: Promise<{ id: string; imageId: string }> }
export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requireAdmin(request)
    const parsed = updateImageSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse('Dữ liệu ảnh không hợp lệ.', 400, parsed.error.flatten().fieldErrors)
    const { id, imageId } = await context.params
    return successResponse({ image: await updateProductImage(id, imageId, parsed.data) })
  } catch (error) { return handleApiError(error) }
}
export async function DELETE(request: NextRequest, context: Context) {
  try {
    await requireAdmin(request)
    const { id, imageId } = await context.params
    return successResponse(await deleteProductImage(id, imageId))
  } catch (error) { return handleApiError(error) }
}
