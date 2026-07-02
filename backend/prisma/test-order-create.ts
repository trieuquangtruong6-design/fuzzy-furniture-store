import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import prisma from '../src/lib/prisma'
import { ApiError } from '../src/lib/api-response'
import {
  cancelUserOrder,
  createOrder,
  getUserOrder,
  listUserOrders,
} from '../src/modules/orders/order.service'

const suffix = randomUUID().slice(0, 8)
const results: Record<string, string> = {}

async function expectsStatus(action: () => Promise<unknown>, status: number) {
  try {
    await action()
    return false
  } catch (error) {
    return error instanceof ApiError && error.status === status
  }
}

async function main() {
  const user = await prisma.user.create({
    data: { email: `order-${suffix}@test.local`, passwordHash: 'test-only', fullName: 'Order Test' },
  })
  const otherUser = await prisma.user.create({
    data: { email: `order-other-${suffix}@test.local`, passwordHash: 'test-only', fullName: 'Other Order Test' },
  })
  const address = await prisma.address.create({
    data: { userId: user.id, fullName: 'Order Receiver', phone: '0900000000', province: 'Province', district: 'District', ward: 'Ward', detail: '123 Street', isDefault: true },
  })
  const category = await prisma.category.create({
    data: { name: `Order ${suffix}`, slug: `order-${suffix}` },
  })
  const product = await prisma.product.create({
    data: {
      categoryId: category.id,
      name: `Order Product ${suffix}`,
      slug: `order-product-${suffix}`,
      description: 'Order transaction test',
      price: '100',
      salePrice: '80',
      images: { create: { imageUrl: '/order-test.png', alt: 'Order test' } },
      variants: { create: { sku: `ORDER-${suffix}`, price: '75', stock: 5 } },
    },
    include: { variants: true },
  })
  const variant = product.variants[0]
  const cart = await prisma.cart.create({ data: { userId: user.id } })

  try {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: product.id, variantId: variant.id, quantity: 2 },
    })
    const key = `order-test-${suffix}`
    const first = await createOrder(user.id, key, {
      addressId: address.id,
      paymentMethod: 'COD',
      note: 'Test order',
    })
    const stockAfter = await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })
    const cartCount = await prisma.cartItem.count({ where: { cartId: cart.id } })
    results.orderCreated = !first.replayed && first.order.status === 'PENDING' ? 'pass' : 'fail'
    results.snapshot = first.order.items.length === 1
      && first.order.items[0]?.productName === product.name
      && first.order.items[0]?.price === '75'
      && first.order.items[0]?.quantity === 2 ? 'pass' : 'fail'
    results.totals = first.order.subtotal === '150' && first.order.shippingFee === '20' && first.order.total === '170' ? 'pass' : 'fail'
    results.stockDecremented = stockAfter.stock === 3 ? 'pass' : 'fail'
    results.cartCleared = cartCount === 0 ? 'pass' : 'fail'
    results.timeline = first.order.statusHistory.length === 1 && first.order.statusHistory[0]?.status === 'PENDING' ? 'pass' : 'fail'
    results.payment = first.order.payment?.provider === 'COD' && first.order.payment.status === 'UNPAID' ? 'pass' : 'fail'

    const replay = await createOrder(user.id, key, {
      addressId: address.id,
      paymentMethod: 'COD',
    })
    const stockAfterReplay = await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })
    results.idempotency = replay.replayed && replay.order.id === first.order.id && stockAfterReplay.stock === 3 ? 'pass' : 'fail'

    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: product.id, variantId: variant.id, quantity: 1 },
    })
    const bankTransfer = await createOrder(user.id, `bank-${suffix}`, {
      addressId: address.id,
      paymentMethod: 'BANK_TRANSFER',
    })
    results.bankTransferPayment = bankTransfer.order.paymentMethod === 'BANK_TRANSFER'
      && bankTransfer.order.payment?.provider === 'BANK_TRANSFER'
      && bankTransfer.order.payment.status === 'UNPAID' ? 'pass' : 'fail'
    const orders = await listUserOrders(user.id)
    const detail = await getUserOrder(user.id, bankTransfer.order.orderCode)
    results.listAndDetail = orders.length === 2 && orders[0]?.id === bankTransfer.order.id
      && detail.id === bankTransfer.order.id ? 'pass' : 'fail'
    results.orderOwnership = await expectsStatus(
      () => getUserOrder(otherUser.id, bankTransfer.order.orderCode),
      404,
    ) ? 'pass' : 'fail'

    const cancelled = await cancelUserOrder(user.id, bankTransfer.order.orderCode)
    const stockAfterCancel = await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })
    results.cancelAndRestock = cancelled.status === 'CANCELLED' && stockAfterCancel.stock === 3
      && cancelled.statusHistory.at(-1)?.status === 'CANCELLED' ? 'pass' : 'fail'
    results.doubleCancelBlocked = await expectsStatus(
      () => cancelUserOrder(user.id, bankTransfer.order.orderCode),
      409,
    ) ? 'pass' : 'fail'

    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: product.id, variantId: variant.id, quantity: 4 },
    })
    results.overStockBlocked = await expectsStatus(() => createOrder(user.id, `overstock-${suffix}`, {
      addressId: address.id,
      paymentMethod: 'BANK_TRANSFER',
    }), 409) ? 'pass' : 'fail'
    const afterFailureStock = await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })
    const afterFailureCart = await prisma.cartItem.count({ where: { cartId: cart.id } })
    const failedOrders = await prisma.order.count({ where: { idempotencyKey: `overstock-${suffix}` } })
    results.rollback = afterFailureStock.stock === 3 && afterFailureCart === 1 && failedOrders === 0 ? 'pass' : 'fail'

    console.log(results)
    if (Object.values(results).some((result) => result !== 'pass')) process.exitCode = 1
  } finally {
    await prisma.order.deleteMany({ where: { userId: user.id } })
    await prisma.cart.deleteMany({ where: { userId: user.id } })
    await prisma.address.deleteMany({ where: { userId: user.id } })
    await prisma.user.delete({ where: { id: user.id } })
    await prisma.user.delete({ where: { id: otherUser.id } })
    await prisma.product.delete({ where: { id: product.id } })
    await prisma.category.delete({ where: { id: category.id } })
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
