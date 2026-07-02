import type { NextRequest } from 'next/server'

import { handleApiError, successResponse } from '@/lib/api-response'
import { getAuthenticatedUserId } from '@/lib/auth'
import { setDefaultAddress } from '@/modules/addresses/address.service'

interface DefaultAddressRouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: NextRequest,
  context: DefaultAddressRouteContext,
) {
  try {
    const userId = getAuthenticatedUserId(request)
    const { id } = await context.params
    const address = await setDefaultAddress(userId, id)

    return successResponse({ address })
  } catch (error) {
    return handleApiError(error)
  }
}
