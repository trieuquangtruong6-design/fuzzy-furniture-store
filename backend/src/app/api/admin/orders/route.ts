import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { handleApiError, successResponse } from '@/lib/api-response'
import { listAdminOrders } from '@/modules/admin-orders/admin-order.service'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    return successResponse({ orders: await listAdminOrders() })
  } catch (error) {
    return handleApiError(error)
  }
}

