import { OrderStatus, Prisma } from '@/generated/prisma/client'
import { ApiError } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import type { UpdateAdminOrderStatusInput } from './admin-order.schema'

const include = {
  user: { select: { id: true, email: true, fullName: true, phone: true } },
  items: { orderBy: { id: 'asc' as const } },
  statusHistory: { orderBy: { createdAt: 'asc' as const } },
  payment: true,
} as const
type AdminOrder = Prisma.OrderGetPayload<{ include: typeof include }>

function serialize(order: AdminOrder) {
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
    payment: order.payment ? { ...order.payment, amount: order.payment.amount.toString() } : null,
  }
}

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
  SHIPPING: [OrderStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
}

export async function listAdminOrders() {
  const orders = await prisma.order.findMany({
    include,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
  return orders.map(serialize)
}

export async function getAdminOrder(id: string) {
  const order = await prisma.order.findUnique({ where: { id }, include })
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng.')
  return serialize(order)
}

export async function updateAdminOrderStatus(id: string, input: UpdateAdminOrderStatusInput) {
  const target = input.status as OrderStatus
  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include })
    if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng.')
    if (!transitions[order.status].includes(target)) {
      throw new ApiError(409, `Không thể chuyển trạng thái từ ${order.status} sang ${target}.`)
    }
    const changed = await tx.order.updateMany({
      where: { id, status: order.status },
      data: { status: target },
    })
    if (changed.count !== 1) throw new ApiError(409, 'Trạng thái đơn hàng vừa thay đổi.')

    if (target === OrderStatus.CANCELLED) {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }
    }
    await tx.orderStatusHistory.create({
      data: {
        orderId: id,
        status: target,
        note: input.note || `Status updated by administrator to ${target}`,
      },
    })
    return tx.order.findUniqueOrThrow({ where: { id }, include })
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  return serialize(updated)
}

export function allowedAdminTransitions(status: OrderStatus) {
  return transitions[status]
}

