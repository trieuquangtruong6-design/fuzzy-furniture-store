import { handleApiError, successResponse } from '@/lib/api-response'
import { getPublicProduct } from '@/modules/products/product.service'

interface ProductRouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(_request: Request, context: ProductRouteContext) {
  try {
    const { slug } = await context.params
    const product = await getPublicProduct(slug)
    return successResponse({ product })
  } catch (error) {
    return handleApiError(error)
  }
}
