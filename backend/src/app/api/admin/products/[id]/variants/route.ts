import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response'
import { productVariantSchema } from '@/modules/admin-products/admin-product.schema'
import { addProductVariant } from '@/modules/admin-products/admin-product.service'

interface Context { params: Promise<{ id: string }> }
export async function POST(request: NextRequest, context: Context) {
  try {
    await requireAdmin(request)
    const parsed = productVariantSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse('Dữ liệu variant không hợp lệ.', 400, parsed.error.flatten().fieldErrors)
    return successResponse({ variant: await addProductVariant((await context.params).id, parsed.data) }, 201)
  } catch (error) { return handleApiError(error) }
}
