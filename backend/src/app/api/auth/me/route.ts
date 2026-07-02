import type { NextRequest } from 'next/server'

import { handleApiError, successResponse } from '@/lib/api-response'
import { getAuthenticatedUserId } from '@/lib/auth'
import { getCurrentUser } from '@/modules/auth/auth.service'

export async function GET(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(request)
    const user = await getCurrentUser(userId)

    return successResponse({ user })
  } catch (error) {
    return handleApiError(error)
  }
}
