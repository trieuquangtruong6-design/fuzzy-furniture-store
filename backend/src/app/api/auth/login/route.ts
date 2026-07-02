import type { NextRequest } from 'next/server'

import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response'
import { setAuthCookie } from '@/lib/cookies'
import { loginSchema } from '@/modules/auth/auth.schema'
import { login } from '@/modules/auth/auth.service'

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => null)
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(
        'Dữ liệu đăng nhập không hợp lệ.',
        400,
        parsed.error.flatten().fieldErrors,
      )
    }

    const { user, token } = await login(parsed.data)
    const response = successResponse({ user })
    setAuthCookie(response, token)

    return response
  } catch (error) {
    return handleApiError(error)
  }
}
