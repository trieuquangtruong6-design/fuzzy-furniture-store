import type { NextRequest } from 'next/server'

import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response'
import { getAuthenticatedUserId } from '@/lib/auth'
import { createAddressSchema } from '@/modules/addresses/address.schema'
import {
  createAddress,
  listAddresses,
} from '@/modules/addresses/address.service'

export async function GET(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(request)
    const addresses = await listAddresses(userId)

    return successResponse({ addresses })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(request)
    const body: unknown = await request.json().catch(() => null)
    const parsed = createAddressSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(
        'Dữ liệu địa chỉ không hợp lệ.',
        400,
        parsed.error.flatten().fieldErrors,
      )
    }

    const address = await createAddress(userId, parsed.data)

    return successResponse({ address }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
