import { handleApiError, successResponse } from '@/lib/api-response'
import { listPublicCategories } from '@/modules/categories/category.service'

export async function GET() {
  try {
    const categories = await listPublicCategories()
    return successResponse({ categories })
  } catch (error) {
    return handleApiError(error)
  }
}
