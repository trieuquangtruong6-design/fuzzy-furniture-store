import { ProductStatus } from '@/generated/prisma/client'
import { ApiError } from '@/lib/api-response'
import prisma from '@/lib/prisma'

const wishlistInclude = {
  product: {
    include: {
      category: { select: { id: true, name: true, slug: true, isActive: true } },
      images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
      variants: {
        orderBy: { createdAt: 'asc' as const },
        select: { id: true, sku: true, stock: true },
      },
    },
  },
} as const

function serializeItem(item: Awaited<ReturnType<typeof loadItems>>[number]) {
  const product = item.product
  return {
    id: item.id,
    createdAt: item.createdAt,
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() ?? null,
      status: product.status,
      isAvailable: product.status === ProductStatus.ACTIVE && product.category.isActive,
      totalStock: product.variants.reduce((total, variant) => total + variant.stock, 0),
      image: product.images[0] ?? null,
      category: product.category,
      variants: product.variants,
    },
  }
}

function loadItems(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: wishlistInclude,
  })
}

export async function getWishlist(userId: string) {
  const items = await loadItems(userId)
  return { items: items.map(serializeItem), itemCount: items.length }
}

export async function addWishlistItem(userId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, status: ProductStatus.ACTIVE, category: { isActive: true } },
    select: { id: true },
  })
  if (!product) throw new ApiError(404, 'Sản phẩm không tồn tại hoặc đã ngừng bán.')

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  })
  return getWishlist(userId)
}

export async function removeWishlistItem(userId: string, productId: string) {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } })
  return getWishlist(userId)
}
