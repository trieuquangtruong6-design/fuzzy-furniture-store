import { randomBytes } from 'node:crypto'
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  ProductStatus,
} from '@/generated/prisma/client'
import { ApiError } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import type { CreateOrderInput } from './order.schema'

const orderInclude = {
  items: { orderBy: { id: 'asc' as const } },
  statusHistory: { orderBy: { createdAt: 'asc' as const } },
  payment: true,
} as const

type OrderResult = Prisma.OrderGetPayload<{ include: typeof orderInclude }>

function serializeOrder(order: OrderResult) {
  return {
    ...order,
    subtotal: order.subtotal.toString(),
    shippingFee: order.shippingFee.toString(),
    discount: order.discount.toString(),
    total: order.total.toString(),
    items: order.items.map((item) => ({
      ...item,
      price: item.price.toString(),
      total: item.total.toString(),
    })),
    payment: order.payment
      ? { ...order.payment, amount: order.payment.amount.toString() }
      : null,
  }
}

function orderCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return `FZ-${date}-${randomBytes(4).toString('hex').toUpperCase()}`
}

function hasCode(error: unknown, ...codes: string[]) {
  return typeof error === 'object' && error !== null && 'code' in error
    && codes.includes(String(error.code))
}

async function findIdempotentOrder(userId: string, idempotencyKey: string) {
  return prisma.order.findFirst({
    where: { userId, idempotencyKey },
    include: orderInclude,
  })
}

export async function createOrder(
  userId: string,
  idempotencyKey: string,
  input: CreateOrderInput,
) {
  const existing = await findIdempotentOrder(userId, idempotencyKey)
  if (existing) return { order: serializeOrder(existing), replayed: true }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const address = await tx.address.findFirst({
        where: { id: input.addressId, userId },
      })
      if (!address) throw new ApiError(400, 'Địa chỉ giao hàng không hợp lệ.')

      const cart = await tx.cart.findUnique({
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
                  color: { select: { name: true } },
                  size: { select: { name: true } },
                },
              },
            },
          },
        },
      })
      if (!cart || !cart.items.length) throw new ApiError(400, 'Giỏ hàng đang trống.')

      let subtotal = new Prisma.Decimal(0)
      const snapshots = cart.items.map((item) => {
        const variant = item.variant
        if (item.product.status !== ProductStatus.ACTIVE || !item.product.category.isActive) {
          throw new ApiError(409, `${item.product.name} hiện không khả dụng.`)
        }
        if (!variant || variant.productId !== item.productId) {
          throw new ApiError(409, `Biến thể của ${item.product.name} không còn hợp lệ.`)
        }
        if (variant.stock < item.quantity) {
          throw new ApiError(409, `${item.product.name} chỉ còn ${variant.stock} sản phẩm.`)
        }
        const price = variant.price ?? item.product.salePrice ?? item.product.price
        const total = price.mul(item.quantity)
        subtotal = subtotal.add(total)
        return {
          productId: item.productId,
          variantId: variant.id,
          productName: item.product.name,
          productImage: item.product.images[0]?.imageUrl ?? '',
          variantName: [variant.color?.name, variant.size?.name].filter(Boolean).join(' / ') || variant.sku,
          price,
          quantity: item.quantity,
          total,
          stock: variant.stock,
        }
      })

      for (const item of snapshots) {
        const decremented = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        })
        if (decremented.count !== 1) {
          throw new ApiError(409, `${item.productName} không còn đủ tồn kho.`)
        }
      }

      const shippingFee = subtotal.greaterThanOrEqualTo(500)
        ? new Prisma.Decimal(0)
        : new Prisma.Decimal(20)
      const discount = new Prisma.Decimal(0)
      const total = subtotal.add(shippingFee).sub(discount)
      const shippingAddress = [
        address.detail,
        address.ward,
        address.district,
        address.province,
      ].join(', ')

      const order = await tx.order.create({
        data: {
          userId,
          orderCode: orderCode(),
          idempotencyKey,
          paymentMethod: input.paymentMethod,
          paymentStatus: PaymentStatus.UNPAID,
          shippingFullName: address.fullName,
          shippingPhone: address.phone,
          shippingAddress,
          subtotal,
          shippingFee,
          discount,
          total,
          note: input.note || null,
          items: {
            create: snapshots.map(({ stock: _stock, ...item }) => item),
          },
          statusHistory: {
            create: { status: OrderStatus.PENDING, note: 'Order placed' },
          },
          payment: {
            create: {
              provider: input.paymentMethod,
              amount: total,
              status: PaymentStatus.UNPAID,
            },
          },
        },
        include: orderInclude,
      })

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
      return order
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

    return { order: serializeOrder(created), replayed: false }
  } catch (error) {
    if (hasCode(error, 'P2002', 'P2034')) {
      const replay = await findIdempotentOrder(userId, idempotencyKey)
      if (replay) return { order: serializeOrder(replay), replayed: true }
      if (hasCode(error, 'P2034')) {
        throw new ApiError(409, 'Tồn kho vừa thay đổi, vui lòng thử lại.')
      }
    }
    throw error
  }
}

export async function listUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
  return orders.map(serializeOrder)
}

export async function getUserOrder(userId: string, orderCode: string) {
  const order = await prisma.order.findFirst({
    where: { userId, orderCode },
    include: orderInclude,
  })
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng.')
  return serializeOrder(order)
}

export async function cancelUserOrder(userId: string, orderCode: string) {
  const cancelled = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { userId, orderCode },
      include: orderInclude,
    })
    if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng.')
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PREPARING) {
      throw new ApiError(409, 'Đơn hàng ở trạng thái hiện tại không thể hủy.')
    }

    const changed = await tx.order.updateMany({
      where: {
        id: order.id,
        status: { in: [OrderStatus.PENDING, OrderStatus.PREPARING] },
      },
      data: { status: OrderStatus.CANCELLED },
    })
    if (changed.count !== 1) throw new ApiError(409, 'Trạng thái đơn hàng vừa thay đổi.')

    for (const item of order.items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        })
      }
    }
    await tx.orderStatusHistory.create({
      data: { orderId: order.id, status: OrderStatus.CANCELLED, note: 'Cancelled by customer' },
    })
    return tx.order.findUniqueOrThrow({
      where: { id: order.id },
      include: orderInclude,
    })
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

  return serializeOrder(cancelled)
}
