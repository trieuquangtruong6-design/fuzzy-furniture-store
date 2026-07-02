import { Prisma, ProductStatus } from '@/generated/prisma/client'
import { ApiError } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import type { AddCartItemInput } from './cart.schema'

const cartInclude = {
  items: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      product: {
        include: {
          category: { select: { id: true, name: true, slug: true, isActive: true } },
          images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
        },
      },
      variant: {
        include: {
          color: { select: { id: true, name: true, code: true, hex: true } },
          size: { select: { id: true, name: true, code: true } },
        },
      },
    },
  },
} as const

type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>

function serializeCart(cart: CartWithItems) {
  let subtotal = new Prisma.Decimal(0)
  const items = cart.items.map((item) => {
    const variant = item.variant
    const unitPrice = variant?.price ?? item.product.salePrice ?? item.product.price
    const lineTotal = unitPrice.mul(item.quantity)
    const isAvailable = item.product.status === ProductStatus.ACTIVE
      && item.product.category.isActive
      && variant !== null
      && variant.productId === item.productId
      && variant.stock >= item.quantity
    subtotal = subtotal.add(lineTotal)
    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: unitPrice.toString(),
      lineTotal: lineTotal.toString(),
      availableStock: variant?.stock ?? 0,
      isAvailable,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        status: item.product.status,
        image: item.product.images[0] ?? null,
        category: item.product.category,
      },
      variant: variant
        ? {
            id: variant.id,
            sku: variant.sku,
            price: variant.price?.toString() ?? null,
            stock: variant.stock,
            color: variant.color,
            size: variant.size,
          }
        : null,
    }
  })
  return {
    id: cart.id,
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: subtotal.toString(),
    hasUnavailableItems: items.some((item) => !item.isAvailable),
    updatedAt: cart.updatedAt,
  }
}

async function loadCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: cartInclude,
  })
}

export async function getCart(userId: string) {
  return serializeCart(await loadCart(userId))
}

async function validatePurchasableItem(
  tx: Prisma.TransactionClient,
  productId: string,
  variantId: string,
) {
  const product = await tx.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      status: true,
      category: { select: { isActive: true } },
      variants: {
        where: { id: variantId },
        select: { id: true, stock: true },
        take: 1,
      },
    },
  })
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm.')
  if (product.status !== ProductStatus.ACTIVE || !product.category.isActive) {
    throw new ApiError(409, 'Sản phẩm hiện không khả dụng.')
  }
  const variant = product.variants[0]
  if (!variant) throw new ApiError(400, 'Biến thể không thuộc sản phẩm đã chọn.')
  if (variant.stock <= 0) throw new ApiError(409, 'Biến thể đã hết hàng.')
  return variant
}

export async function addCartItem(userId: string, input: AddCartItemInput) {
  await prisma.$transaction(async (tx) => {
    const variant = await validatePurchasableItem(tx, input.productId, input.variantId)
    const cart = await tx.cart.upsert({ where: { userId }, create: { userId }, update: {} })
    const existing = await tx.cartItem.findFirst({
      where: { cartId: cart.id, productId: input.productId, variantId: input.variantId },
      select: { id: true, quantity: true },
    })
    const quantity = (existing?.quantity ?? 0) + input.quantity
    if (quantity > variant.stock) throw new ApiError(409, `Chỉ còn ${variant.stock} sản phẩm trong kho.`)
    if (existing) {
      await tx.cartItem.update({ where: { id: existing.id }, data: { quantity } })
    } else {
      await tx.cartItem.create({
        data: { cartId: cart.id, productId: input.productId, variantId: input.variantId, quantity },
      })
    }
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  return getCart(userId)
}

export async function updateCartItem(userId: string, itemId: string, quantity: number) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { is: { userId } } },
    select: { id: true, productId: true, variantId: true },
  })
  if (!item) throw new ApiError(404, 'Không tìm thấy sản phẩm trong giỏ hàng.')
  if (!item.variantId) throw new ApiError(409, 'Biến thể trong giỏ hàng không còn hợp lệ.')
  const variant = await validatePurchasableItem(prisma, item.productId, item.variantId)
  if (quantity > variant.stock) throw new ApiError(409, `Chỉ còn ${variant.stock} sản phẩm trong kho.`)
  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } })
  return getCart(userId)
}

export async function deleteCartItem(userId: string, itemId: string) {
  const result = await prisma.cartItem.deleteMany({
    where: { id: itemId, cart: { is: { userId } } },
  })
  if (!result.count) throw new ApiError(404, 'Không tìm thấy sản phẩm trong giỏ hàng.')
  return getCart(userId)
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } })
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  return getCart(userId)
}

