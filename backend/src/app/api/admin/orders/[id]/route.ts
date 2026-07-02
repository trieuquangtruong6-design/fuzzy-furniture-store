import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { handleApiError, successResponse } from '@/lib/api-response'
import { getAdminOrder } from '@/modules/admin-orders/admin-order.service'

type Context = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: Context) {
  try {
    await requireAdmin(request)
    return successResponse({ order: await getAdminOrder((await context.params).id) })
  } catch (error) {
    return handleApiError(error)
  }
}

