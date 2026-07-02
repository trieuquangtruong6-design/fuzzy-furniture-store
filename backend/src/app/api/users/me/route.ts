import type { NextRequest } from 'next/server'

import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response'
import { getAuthenticatedUserId } from '@/lib/auth'
import { updateProfileSchema } from '@/modules/users/user.schema'
import { getProfile, updateProfile } from '@/modules/users/user.service'

export async function GET(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(request)
    const user = await getProfile(userId)

    return successResponse({ user })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(request)
    const body: unknown = await request.json().catch(() => null)
    const parsed = updateProfileSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(
        'Dữ liệu hồ sơ không hợp lệ.',
        400,
        parsed.error.flatten().fieldErrors,
      )
    }

    const user = await updateProfile(userId, parsed.data)

    return successResponse({ user })
  } catch (error) {
    return handleApiError(error)
  }
}
