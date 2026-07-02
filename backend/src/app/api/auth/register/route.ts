import type { NextRequest } from 'next/server'

import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response'
import { setAuthCookie } from '@/lib/cookies'
import { registerSchema } from '@/modules/auth/auth.schema'
import { register } from '@/modules/auth/auth.service'

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => null)
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(
        'Dữ liệu đăng ký không hợp lệ.',
        400,
        parsed.error.flatten().fieldErrors,
      )
    }

    const { user, token } = await register(parsed.data)
    const response = successResponse({ user }, 201)
    setAuthCookie(response, token)

    return response
  } catch (error) {
    return handleApiError(error)
  }
}
