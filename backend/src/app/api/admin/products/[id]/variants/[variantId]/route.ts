import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response'
import { updateVariantSchema } from '@/modules/admin-products/admin-product.schema'
import { deleteProductVariant, updateProductVariant } from '@/modules/admin-products/admin-product.service'

interface Context { params: Promise<{ id: string; variantId: string }> }
export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requireAdmin(request)
    const parsed = updateVariantSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse('Dữ liệu variant không hợp lệ.', 400, parsed.error.flatten().fieldErrors)
    const { id, variantId } = await context.params
    return successResponse({ variant: await updateProductVariant(id, variantId, parsed.data) })
  } catch (error) { return handleApiError(error) }
}
export async function DELETE(request: NextRequest, context: Context) {
  try {
    await requireAdmin(request)
    const { id, variantId } = await context.params
    return successResponse(await deleteProductVariant(id, variantId))
  } catch (error) { return handleApiError(error) }
}
