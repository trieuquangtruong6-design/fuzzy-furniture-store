import type { NextRequest } from 'next/server'

import { requireAdmin } from '@/lib/admin'
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response'
import { createCategorySchema } from '@/modules/categories/category.schema'
import {
  createCategory,
  listAdminCategories,
} from '@/modules/categories/category.service'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const categories = await listAdminCategories()
    return successResponse({ categories })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body: unknown = await request.json().catch(() => null)
    const parsed = createCategorySchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(
        'Dữ liệu danh mục không hợp lệ.',
        400,
        parsed.error.flatten().fieldErrors,
      )
    }

    const category = await createCategory(parsed.data)
    return successResponse({ category }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
