import type { NextRequest } from 'next/server'

import { requireAdmin } from '@/lib/admin'
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response'
import { updateCategorySchema } from '@/modules/categories/category.schema'
import {
  deleteOrHideCategory,
  getAdminCategory,
  updateCategory,
} from '@/modules/categories/category.service'

interface AdminCategoryRouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: AdminCategoryRouteContext,
) {
  try {
    await requireAdmin(request)
    const { id } = await context.params
    const category = await getAdminCategory(id)
    return successResponse({ category })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  context: AdminCategoryRouteContext,
) {
  try {
    await requireAdmin(request)
    const { id } = await context.params
    const body: unknown = await request.json().catch(() => null)
    const parsed = updateCategorySchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(
        'Dữ liệu danh mục không hợp lệ.',
        400,
        parsed.error.flatten().fieldErrors,
      )
    }

    const category = await updateCategory(id, parsed.data)
    return successResponse({ category })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  context: AdminCategoryRouteContext,
) {
  try {
    await requireAdmin(request)
    const { id } = await context.params
    const result = await deleteOrHideCategory(id)
    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
