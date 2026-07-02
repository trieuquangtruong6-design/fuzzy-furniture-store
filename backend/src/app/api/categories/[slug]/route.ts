import { handleApiError, successResponse } from '@/lib/api-response'
import { getPublicCategory } from '@/modules/categories/category.service'

interface CategoryRouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(_request: Request, context: CategoryRouteContext) {
  try {
    const { slug } = await context.params
    const category = await getPublicCategory(slug)
    return successResponse({ category })
  } catch (error) {
    return handleApiError(error)
  }
}
