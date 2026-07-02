import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import prisma from '../src/lib/prisma'
import { ApiError } from '../src/lib/api-response'
import { createOrder } from '../src/modules/orders/order.service'
import {
  getAdminOrder,
  listAdminOrders,
  updateAdminOrderStatus,
} from '../src/modules/admin-orders/admin-order.service'

const suffix = randomUUID().slice(0, 8)
const results: Record<string, string> = {}

async function expectsConflict(action: () => Promise<unknown>) {
  try { await action(); return false } catch (error) { return error instanceof ApiError && error.status === 409 }
}

async function main() {
  const user = await prisma.user.create({ data: { email: `admin-order-${suffix}@test.local`, passwordHash: 'test', fullName: 'Admin Order Test' } })
  const address = await prisma.address.create({ data: { userId: user.id, fullName: 'Receiver', phone: '0900000000', province: 'P', district: 'D', ward: 'W', detail: 'Street', isDefault: true } })
  const category = await prisma.category.create({ data: { name: `Admin order ${suffix}`, slug: `admin-order-${suffix}` } })
  const product = await prisma.product.create({
    data: {
      categoryId: category.id, name: `Admin Product ${suffix}`, slug: `admin-product-${suffix}`,
      description: 'Admin order test', price: '100',
      images: { create: { imageUrl: '/admin-order.png', alt: 'Test' } },
      variants: { create: { sku: `ADMIN-ORDER-${suffix}`, stock: 10 } },
    },
    include: { variants: true },
  })
  const cart = await prisma.cart.create({ data: { userId: user.id } })
  const variant = product.variants[0]

  try {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId: product.id, variantId: variant.id, quantity: 2 } })
    const first = await createOrder(user.id, `workflow-${suffix}`, { addressId: address.id, paymentMethod: 'COD' })
    results.invalidSkipBlocked = await expectsConflict(() => updateAdminOrderStatus(first.order.id, { status: 'SHIPPING' })) ? 'pass' : 'fail'
    await updateAdminOrderStatus(first.order.id, { status: 'PREPARING', note: 'Packing' })
    await updateAdminOrderStatus(first.order.id, { status: 'SHIPPING', note: 'With carrier' })
    const completed = await updateAdminOrderStatus(first.order.id, { status: 'COMPLETED', note: 'Delivered' })
    results.forwardWorkflow = completed.status === 'COMPLETED'
      && completed.statusHistory.map((entry) => entry.status).join(',') === 'PENDING,PREPARING,SHIPPING,COMPLETED' ? 'pass' : 'fail'
    results.terminalBlocked = await expectsConflict(() => updateAdminOrderStatus(first.order.id, { status: 'PREPARING' })) ? 'pass' : 'fail'

    await prisma.cartItem.create({ data: { cartId: cart.id, productId: product.id, variantId: variant.id, quantity: 1 } })
    const second = await createOrder(user.id, `cancel-${suffix}`, { addressId: address.id, paymentMethod: 'BANK_TRANSFER' })
    const stockBeforeCancel = (await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock
    const cancelled = await updateAdminOrderStatus(second.order.id, { status: 'CANCELLED', note: 'Customer requested' })
    const stockAfterCancel = (await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock
    results.cancelRestock = cancelled.status === 'CANCELLED' && stockAfterCancel === stockBeforeCancel + 1 ? 'pass' : 'fail'
    results.doubleCancelBlocked = await expectsConflict(() => updateAdminOrderStatus(second.order.id, { status: 'CANCELLED' })) ? 'pass' : 'fail'

    const list = await listAdminOrders()
    const detail = await getAdminOrder(first.order.id)
    results.listDetailUser = list.some((order) => order.id === first.order.id)
      && detail.user.email === user.email && detail.items.length === 1 ? 'pass' : 'fail'
    console.log(results)
    if (Object.values(results).some((result) => result !== 'pass')) process.exitCode = 1
  } finally {
    await prisma.order.deleteMany({ where: { userId: user.id } })
    await prisma.cart.deleteMany({ where: { userId: user.id } })
    await prisma.address.deleteMany({ where: { userId: user.id } })
    await prisma.user.delete({ where: { id: user.id } })
    await prisma.product.delete({ where: { id: product.id } })
    await prisma.category.delete({ where: { id: category.id } })
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
