import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import prisma from '../src/lib/prisma'
import { createOrder } from '../src/modules/orders/order.service'

const suffix = randomUUID().slice(0, 8)

async function main() {
  const category = await prisma.category.create({
    data: { name: `Concurrency ${suffix}`, slug: `concurrency-${suffix}` },
  })
  const product = await prisma.product.create({
    data: {
      categoryId: category.id,
      name: `Last Item ${suffix}`,
      slug: `last-item-${suffix}`,
      description: 'Concurrency test product',
      price: '100',
      images: { create: { imageUrl: '/last-item.png', alt: 'Last item' } },
      variants: { create: { sku: `LAST-${suffix}`, stock: 1 } },
    },
    include: { variants: true },
  })
  const users = await Promise.all([1, 2].map((number) => prisma.user.create({
    data: { email: `concurrent-${number}-${suffix}@test.local`, passwordHash: 'test', fullName: `Buyer ${number}` },
  })))

  try {
    const addresses = await Promise.all(users.map((user) => prisma.address.create({
      data: { userId: user.id, fullName: user.fullName, phone: '0900000000', province: 'P', district: 'D', ward: 'W', detail: 'Street', isDefault: true },
    })))
    const carts = await Promise.all(users.map((user) => prisma.cart.create({ data: { userId: user.id } })))
    await Promise.all(carts.map((cart) => prisma.cartItem.create({
      data: { cartId: cart.id, productId: product.id, variantId: product.variants[0].id, quantity: 1 },
    })))

    const attempts = await Promise.allSettled(users.map((user, index) => createOrder(
      user.id,
      `concurrent-${index}-${suffix}`,
      { addressId: addresses[index].id, paymentMethod: 'COD' },
    )))
    const fulfilled = attempts.filter((attempt) => attempt.status === 'fulfilled')
    const rejected = attempts.filter((attempt) => attempt.status === 'rejected')
    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: product.variants[0].id } })
    const orderCount = await prisma.order.count({ where: { userId: { in: users.map((user) => user.id) } } })
    const remainingCartItems = await prisma.cartItem.count({ where: { cartId: { in: carts.map((cart) => cart.id) } } })

    const passed = fulfilled.length === 1
      && rejected.length === 1
      && variant.stock === 0
      && orderCount === 1
      && remainingCartItems === 1
    console.log({
      oneOrderSucceeded: fulfilled.length === 1 ? 'pass' : 'fail',
      competingOrderBlocked: rejected.length === 1 ? 'pass' : 'fail',
      stockNeverNegative: variant.stock === 0 ? 'pass' : 'fail',
      noDuplicateOrder: orderCount === 1 ? 'pass' : 'fail',
      losingCartPreserved: remainingCartItems === 1 ? 'pass' : 'fail',
    })
    if (!passed) process.exitCode = 1
  } finally {
    await prisma.order.deleteMany({ where: { userId: { in: users.map((user) => user.id) } } })
    await prisma.cart.deleteMany({ where: { userId: { in: users.map((user) => user.id) } } })
    await prisma.address.deleteMany({ where: { userId: { in: users.map((user) => user.id) } } })
    await prisma.user.deleteMany({ where: { id: { in: users.map((user) => user.id) } } })
    await prisma.product.delete({ where: { id: product.id } })
    await prisma.category.delete({ where: { id: category.id } })
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
