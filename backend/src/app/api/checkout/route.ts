import type { NextRequest } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-response'
import { getCheckout } from '@/modules/checkout/checkout.service'

export async function GET(request: NextRequest) {
  try {
    return successResponse({ checkout: await getCheckout(getAuthenticatedUserId(request)) })
  } catch (error) {
    return handleApiError(error)
  }
}

