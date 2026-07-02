import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response'
import { updateAdminOrderStatusSchema } from '@/modules/admin-orders/admin-order.schema'
import { updateAdminOrderStatus } from '@/modules/admin-orders/admin-order.service'

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requireAdmin(request)
    const parsed = updateAdminOrderStatusSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return errorResponse('Trạng thái đơn hàng không hợp lệ.', 400, parsed.error.flatten().fieldErrors)
    }
    return successResponse({ order: await updateAdminOrderStatus((await context.params).id, parsed.data) })
  } catch (error) {
    return handleApiError(error)
  }
}

