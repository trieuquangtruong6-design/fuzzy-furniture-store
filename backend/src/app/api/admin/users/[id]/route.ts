import type { NextRequest } from 'next/server'

import { requireAdmin } from '@/lib/admin'
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response'
import { updateAdminUserSchema } from '@/modules/admin-users/admin-user.schema'
import { updateAdminUser } from '@/modules/admin-users/admin-user.service'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(request)
    const parsed = updateAdminUserSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return errorResponse('Dữ liệu cập nhật người dùng không hợp lệ.', 400, parsed.error.flatten().fieldErrors)
    }
    return successResponse({
      user: await updateAdminUser(admin.id, (await context.params).id, parsed.data),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
