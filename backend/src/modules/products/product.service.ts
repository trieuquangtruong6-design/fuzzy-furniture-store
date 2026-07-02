import { Prisma, ProductStatus } from '@/generated/prisma/client'
import { ApiError } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import type { ProductListQuery } from '@/modules/products/product.schema'

const publicListSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  salePrice: true,
  status: true,
  isFeatured: true,
  createdAt: true,
  category: {
    select: { id: true, name: true, slug: true, imageUrl: true },
  },
  images: {
    select: { imageUrl: true, alt: true, sortOrder: true },
    orderBy: { sortOrder: 'asc' as const },
    take: 1,
  },
  variants: {
    select: { stock: true },
  },
} as const

const publicDetailSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  salePrice: true,
  status: true,
  isFeatured: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: { id: true, name: true, slug: true, imageUrl: true },
  },
  images: {
    select: { id: true, imageUrl: true, alt: true, sortOrder: true },
    orderBy: { sortOrder: 'asc' as const },
  },
  variants: {
    select: {
      id: true,
      sku: true,
      price: true,
      stock: true,
      color: { select: { id: true, name: true, code: true, hex: true } },
      size: { select: { id: true, name: true, code: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
} as const

function serializeListProduct<
  T extends {
    price: Prisma.Decimal
    salePrice: Prisma.Decimal | null
    variants: Array<{ stock: number }>
  },
>(product: T) {
  const { variants, ...data } = product
  return {
    ...data,
    price: product.price.toString(),
    salePrice: product.salePrice?.toString() ?? null,
    totalStock: variants.reduce((total, variant) => total + variant.stock, 0),
  }
}

function serializeDetailProduct<
  T extends {
    price: Prisma.Decimal
    salePrice: Prisma.Decimal | null
    variants: Array<{ price: Prisma.Decimal | null; stock: number }>
  },
>(product: T) {
  return {
    ...product,
    price: product.price.toString(),
    salePrice: product.salePrice?.toString() ?? null,
    totalStock: product.variants.reduce(
      (total, variant) => total + variant.stock,
      0,
    ),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: variant.price?.toString() ?? null,
    })),
  }
}

function effectivePriceFilter(
  operator: 'gte' | 'lte',
  value: number,
): Prisma.ProductWhereInput {
  return {
    OR: [
      { salePrice: { not: null, [operator]: value } },
      { salePrice: null, price: { [operator]: value } },
    ],
  }
}

function buildProductWhere(query: ProductListQuery) {
  const and: Prisma.ProductWhereInput[] = []

  if (query.minPrice !== undefined) {
    and.push(effectivePriceFilter('gte', query.minPrice))
  }
  if (query.maxPrice !== undefined) {
    and.push(effectivePriceFilter('lte', query.maxPrice))
  }
  const variantFilter: Prisma.ProductVariantWhereInput = {
    ...(query.color
      ? { color: { is: { code: query.color.toUpperCase() } } }
      : {}),
    ...(query.size
      ? { size: { is: { code: query.size.toUpperCase() } } }
      : {}),
    ...(query.inStock === 'true' ? { stock: { gt: 0 } } : {}),
  }
  if (Object.keys(variantFilter).length > 0) {
    and.push({ variants: { some: variantFilter } })
  }
  if (query.inStock === 'false') {
    and.push({ variants: { none: { stock: { gt: 0 } } } })
  }

  return {
    status: ProductStatus.ACTIVE,
    category: {
      is: {
        isActive: true,
        ...(query.category ? { slug: query.category } : {}),
      },
    },
    ...(query.search
      ? { name: { contains: query.search, mode: 'insensitive' as const } }
      : {}),
    ...(and.length ? { AND: and } : {}),
  } satisfies Prisma.ProductWhereInput
}

function buildProductOrderBy(
  sort: ProductListQuery['sort'],
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'price_asc':
      return [{ price: 'asc' }, { id: 'asc' }]
    case 'price_desc':
      return [{ price: 'desc' }, { id: 'desc' }]
    case 'name_asc':
      return [{ name: 'asc' }, { id: 'asc' }]
    default:
      return [{ createdAt: 'desc' }, { id: 'desc' }]
  }
}

export async function listPublicProducts(query: ProductListQuery) {
  try {
    const products = await prisma.product.findMany({
      where: buildProductWhere(query),
      select: publicListSelect,
      orderBy: buildProductOrderBy(query.sort),
      take: query.limit + 1,
      ...(query.cursor
        ? { cursor: { id: query.cursor }, skip: 1 }
        : {}),
    })
    const hasMore = products.length > query.limit
    const page = hasMore ? products.slice(0, query.limit) : products

    return {
      products: page.map(serializeListProduct),
      pageInfo: {
        nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
        hasMore,
      },
    }
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      throw new ApiError(400, 'Cursor sản phẩm không hợp lệ.')
    }
    throw error
  }
}

export async function listFeaturedProducts(limit: number) {
  const products = await prisma.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      category: { is: { isActive: true } },
    },
    select: publicListSelect,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit,
  })
  return products.map(serializeListProduct)
}

export async function getPublicProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      status: ProductStatus.ACTIVE,
      category: { is: { isActive: true } },
    },
    select: publicDetailSelect,
  })

  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm.')
  return serializeDetailProduct(product)
}

export async function listRelatedProducts(slug: string, limit: number) {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      status: ProductStatus.ACTIVE,
      category: { is: { isActive: true } },
    },
    select: { id: true, categoryId: true },
  })

  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm.')

  const related = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      categoryId: product.categoryId,
      status: ProductStatus.ACTIVE,
      category: { is: { isActive: true } },
    },
    select: publicListSelect,
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    take: limit,
  })
  return related.map(serializeListProduct)
}
