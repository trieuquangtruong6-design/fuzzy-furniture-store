import type { NextRequest } from 'next/server'

import { requireAdmin } from '@/lib/admin'
import { handleApiError, successResponse } from '@/lib/api-response'
import { listAdminUsers } from '@/modules/admin-users/admin-user.service'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    return successResponse({ users: await listAdminUsers() })
  } catch (error) {
    return handleApiError(error)
  }
}
