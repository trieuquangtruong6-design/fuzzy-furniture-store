import type { NextRequest } from 'next/server'

import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response'
import { getAuthenticatedUserId } from '@/lib/auth'
import { updateAddressSchema } from '@/modules/addresses/address.schema'
import {
  deleteAddress,
  updateAddress,
} from '@/modules/addresses/address.service'

interface AddressRouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: NextRequest,
  context: AddressRouteContext,
) {
  try {
    const userId = getAuthenticatedUserId(request)
    const { id } = await context.params
    const body: unknown = await request.json().catch(() => null)
    const parsed = updateAddressSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(
        'Dữ liệu địa chỉ không hợp lệ.',
        400,
        parsed.error.flatten().fieldErrors,
      )
    }

    const address = await updateAddress(userId, id, parsed.data)

    return successResponse({ address })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  context: AddressRouteContext,
) {
  try {
    const userId = getAuthenticatedUserId(request)
    const { id } = await context.params
    const result = await deleteAddress(userId, id)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
