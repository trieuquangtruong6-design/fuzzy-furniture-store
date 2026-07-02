import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response'
import { updateProductSchema } from '@/modules/admin-products/admin-product.schema'
import { deleteOrHideProduct, getAdminProduct, updateAdminProduct } from '@/modules/admin-products/admin-product.service'

interface Context { params: Promise<{ id: string }> }
export async function GET(request: NextRequest, context: Context) {
  try { await requireAdmin(request); return successResponse({ product: await getAdminProduct((await context.params).id) }) }
  catch (error) { return handleApiError(error) }
}
export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requireAdmin(request)
    const parsed = updateProductSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse('Dữ liệu sản phẩm không hợp lệ.', 400, parsed.error.flatten().fieldErrors)
    return successResponse({ product: await updateAdminProduct((await context.params).id, parsed.data) })
  } catch (error) { return handleApiError(error) }
}
export async function DELETE(request: NextRequest, context: Context) {
  try { await requireAdmin(request); return successResponse(await deleteOrHideProduct((await context.params).id)) }
  catch (error) { return handleApiError(error) }
}
