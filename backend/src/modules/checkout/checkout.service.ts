import { Prisma, ProductStatus } from '@/generated/prisma/client'
import { ApiError } from '@/lib/api-response'
import prisma from '@/lib/prisma'

const FREE_SHIPPING_THRESHOLD = new Prisma.Decimal(500)
const STANDARD_SHIPPING_FEE = new Prisma.Decimal(20)

export async function getCheckout(userId: string) {
  const [cart, addresses] = await Promise.all([
    prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
          include: {
            product: {
              include: {
                category: { select: { isActive: true } },
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
            variant: {
              include: {
                color: { select: { name: true, code: true } },
                size: { select: { name: true, code: true } },
              },
            },
          },
        },
      },
    }),
    prisma.address.findMany({
      where: { userId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        province: true,
        district: true,
        ward: true,
        detail: true,
        isDefault: true,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    }),
  ])

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Giỏ hàng đang trống.')
  }

  let subtotal = new Prisma.Decimal(0)
  const invalidItems: Array<{ itemId: string; productName: string; reason: string }> = []
  const items = cart.items.map((item) => {
    const variant = item.variant
    let reason = ''
    if (item.product.status !== ProductStatus.ACTIVE || !item.product.category.isActive) {
      reason = 'Sản phẩm hiện không hoạt động.'
    } else if (!variant || variant.productId !== item.productId) {
      reason = 'Biến thể không còn hợp lệ.'
    } else if (variant.stock < item.quantity) {
      reason = `Chỉ còn ${variant.stock} sản phẩm trong kho.`
    }
    if (reason) invalidItems.push({ itemId: item.id, productName: item.product.name, reason })

    const unitPrice = variant?.price ?? item.product.salePrice ?? item.product.price
    const lineTotal = unitPrice.mul(item.quantity)
    subtotal = subtotal.add(lineTotal)
    return {
      cartItemId: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.product.name,
      productImage: item.product.images[0]?.imageUrl ?? null,
      variantName: variant
        ? [variant.color?.name, variant.size?.name].filter(Boolean).join(' / ') || variant.sku
        : null,
      sku: variant?.sku ?? null,
      unitPrice: unitPrice.toString(),
      quantity: item.quantity,
      lineTotal: lineTotal.toString(),
      availableStock: variant?.stock ?? 0,
    }
  })

  if (invalidItems.length) {
    throw new ApiError(409, 'Một số sản phẩm trong giỏ hàng không còn khả dụng.', { items: invalidItems })
  }

  const shippingFee = subtotal.greaterThanOrEqualTo(FREE_SHIPPING_THRESHOLD)
    ? new Prisma.Decimal(0)
    : STANDARD_SHIPPING_FEE
  const discount = new Prisma.Decimal(0)
  const total = subtotal.add(shippingFee).sub(discount)

  return {
    items,
    addresses,
    defaultAddress: addresses.find((address) => address.isDefault) ?? null,
    summary: {
      subtotal: subtotal.toString(),
      shippingFee: shippingFee.toString(),
      discount: discount.toString(),
      total: total.toString(),
      currency: 'USD',
    },
    shippingPolicy: {
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD.toString(),
      standardShippingFee: STANDARD_SHIPPING_FEE.toString(),
    },
  }
}

