import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient, ProductStatus } from '../src/generated/prisma/client'

const baseUrl = 'http://127.0.0.1:3000'
const hiddenSlug = 'client-hidden-product-smoke'
const connectionString = process.env.DATABASE_URL

if (!connectionString) throw new Error('DATABASE_URL is not configured')

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

interface ProductResult {
  id: string
  name: string
  slug: string
  price: string
  salePrice: string | null
  status: string
  isFeatured: boolean
  totalStock: number
  category: { slug: string }
  images?: Array<{ imageUrl: string }>
  variants?: Array<{ sku: string; stock: number }>
}

interface ProductResponse {
  success: boolean
  data?: {
    products?: ProductResult[]
    product?: ProductResult
    pageInfo?: { nextCursor: string | null; hasMore: boolean }
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

async function get(path: string, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${path}`)
  const body = (await response.json()) as ProductResponse
  assert(
    response.status === expectedStatus,
    `${path}: expected ${expectedStatus}, received ${response.status}`,
  )
  return body
}

async function main() {
  await prisma.product.deleteMany({ where: { slug: hiddenSlug } })

  try {
    const chairs = await prisma.category.findUniqueOrThrow({
      where: { slug: 'chairs' },
      select: { id: true },
    })
    await prisma.product.create({
      data: {
        categoryId: chairs.id,
        name: 'Client Hidden Product Smoke',
        slug: hiddenSlug,
        description: 'Inactive product used to verify client visibility.',
        price: '9999.00',
        status: ProductStatus.INACTIVE,
      },
    })

    const firstPage = await get('/api/products?limit=3')
    const firstProducts = firstPage.data?.products ?? []
    assert(firstProducts.length === 3, 'First cursor page has wrong size')
    assert(firstPage.data?.pageInfo?.hasMore, 'First page should have more data')
    const cursor = firstPage.data?.pageInfo?.nextCursor
    assert(cursor, 'First page did not return a cursor')

    const secondPage = await get(
      `/api/products?limit=3&cursor=${encodeURIComponent(cursor)}`,
    )
    const secondProducts = secondPage.data?.products ?? []
    const firstIds = new Set(firstProducts.map((product) => product.id))
    assert(
      secondProducts.every((product) => !firstIds.has(product.id)),
      'Cursor pages contain duplicate products',
    )

    const search = await get('/api/products?search=Buddy')
    assert(
      search.data?.products?.some((product) => product.slug === 'buddy-chair'),
      'Product search did not find Buddy Chair',
    )

    const category = await get('/api/products?category=chairs')
    assert(
      category.data?.products?.every(
        (product) => product.category.slug === 'chairs',
      ),
      'Category filter returned an unrelated product',
    )

    const attributes = await get(
      '/api/products?color=BEIGE&size=M&inStock=true',
    )
    assert(
      (attributes.data?.products?.length ?? 0) > 0,
      'Combined color/size/stock filter returned no products',
    )

    const priceRange = await get('/api/products?minPrice=30&maxPrice=200')
    assert(
      priceRange.data?.products?.every((product) => {
        const effectivePrice = Number(product.salePrice ?? product.price)
        return effectivePrice >= 30 && effectivePrice <= 200
      }),
      'Price filter returned a product outside the range',
    )

    const sorted = await get('/api/products?sort=price_asc&limit=50')
    const prices = (sorted.data?.products ?? []).map((product) =>
      Number(product.price),
    )
    assert(
      prices.every((price, index) => index === 0 || prices[index - 1] <= price),
      'Price ascending sort is incorrect',
    )

    await get('/api/products?minPrice=200&maxPrice=100', 400)

    const detail = await get('/api/products/buddy-chair')
    assert(detail.data?.product?.slug === 'buddy-chair', 'Product detail failed')
    assert(
      (detail.data?.product?.images?.length ?? 0) > 0,
      'Product detail has no images',
    )
    assert(
      (detail.data?.product?.variants?.length ?? 0) > 0,
      'Product detail has no variants',
    )

    const featured = await get('/api/products/featured?limit=8')
    assert(
      featured.data?.products?.every((product) => product.isFeatured),
      'Featured endpoint returned a non-featured product',
    )

    const related = await get('/api/products/buddy-chair/related?limit=4')
    assert(
      related.data?.products?.every(
        (product) =>
          product.slug !== 'buddy-chair' && product.category.slug === 'chairs',
      ),
      'Related products are invalid',
    )

    await get(`/api/products/${hiddenSlug}`, 404)
    const allPublic = await get('/api/products?limit=50')
    assert(
      allPublic.data?.products?.every(
        (product) =>
          product.status === 'ACTIVE' && product.slug !== hiddenSlug,
      ),
      'Inactive product leaked into public list',
    )

    console.log({
      cursorPagination: 'pass',
      noCursorDuplicates: 'pass',
      search: 'pass',
      categoryFilter: 'pass',
      attributeAndStockFilter: 'pass',
      priceFilterAndSort: 'pass',
      detailImagesVariants: 'pass',
      featured: 'pass',
      related: 'pass',
      inactiveVisibility: 'pass',
      invalidQueryValidation: 'pass',
    })
  } finally {
    await prisma.product.deleteMany({ where: { slug: hiddenSlug } })
  }
}

main()
  .catch((error: unknown) => {
    console.error('Client Product API smoke test failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
