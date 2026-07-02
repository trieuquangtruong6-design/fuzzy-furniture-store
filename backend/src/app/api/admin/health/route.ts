import type { NextRequest } from 'next/server'

import { requireAdmin } from '@/lib/admin'
import { handleApiError, successResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)

    return successResponse({
      ready: true,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
