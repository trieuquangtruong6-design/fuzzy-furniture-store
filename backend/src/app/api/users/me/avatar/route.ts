import type { NextRequest } from 'next/server'

import {
  ApiError,
  handleApiError,
  successResponse,
} from '@/lib/api-response'
import { getAuthenticatedUserId } from '@/lib/auth'
import { saveAvatar } from '@/modules/users/avatar.service'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(request)
    const formData = await request.formData().catch(() => null)

    if (!formData) {
      throw new ApiError(400, 'Dữ liệu upload không hợp lệ.')
    }

    const avatar = formData.get('avatar')

    if (!(avatar instanceof File)) {
      throw new ApiError(400, 'Vui lòng chọn file avatar.')
    }

    const result = await saveAvatar(userId, avatar)
    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
