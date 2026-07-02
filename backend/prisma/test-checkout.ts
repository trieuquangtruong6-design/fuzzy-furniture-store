import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import prisma from '../src/lib/prisma'
import { ApiError } from '../src/lib/api-response'
import { getCheckout } from '../src/modules/checkout/checkout.service'

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
    data: { email: `checkout-${suffix}@test.local`, passwordHash: 'test-only', fullName: 'Checkout Test' },
  })
  const category = await prisma.category.create({
    data: { name: `Checkout ${suffix}`, slug: `checkout-${suffix}` },
  })
  const product = await prisma.product.create({
    data: {
      categoryId: category.id,
      name: `Checkout Product ${suffix}`,
      slug: `checkout-product-${suffix}`,
      description: 'Checkout test product',
      price: '100',
      salePrice: '80',
      images: { create: { imageUrl: '/checkout-test.png', alt: 'Checkout test' } },
      variants: { create: { sku: `CHECKOUT-${suffix}`, price: '75', stock: 5 } },
    },
    include: { variants: true },
  })

  try {
    results.emptyCartBlocked = await expectsStatus(() => getCheckout(user.id), 400) ? 'pass' : 'fail'
    const firstAddress = await prisma.address.create({
      data: { userId: user.id, fullName: 'First', phone: '0900000001', province: 'A', district: 'B', ward: 'C', detail: 'One' },
    })
    const defaultAddress = await prisma.address.create({
      data: { userId: user.id, fullName: 'Default', phone: '0900000002', province: 'D', district: 'E', ward: 'F', detail: 'Two', isDefault: true },
    })
    const cart = await prisma.cart.create({ data: { userId: user.id } })
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: product.id, variantId: product.variants[0].id, quantity: 2 },
    })
    const checkout = await getCheckout(user.id)
    results.databasePrice = checkout.summary.subtotal === '150' && checkout.items[0]?.unitPrice === '75' ? 'pass' : 'fail'
    results.totals = checkout.summary.shippingFee === '20' && checkout.summary.total === '170' ? 'pass' : 'fail'
    results.defaultAddress = checkout.defaultAddress?.id === defaultAddress.id && checkout.addresses[0]?.id === defaultAddress.id ? 'pass' : 'fail'
    results.allAddresses = checkout.addresses.some((address) => address.id === firstAddress.id) ? 'pass' : 'fail'

    await prisma.productVariant.update({ where: { id: product.variants[0].id }, data: { stock: 1 } })
    results.stockRechecked = await expectsStatus(() => getCheckout(user.id), 409) ? 'pass' : 'fail'
    await prisma.productVariant.update({ where: { id: product.variants[0].id }, data: { stock: 5 } })
    await prisma.category.update({ where: { id: category.id }, data: { isActive: false } })
    results.inactiveRechecked = await expectsStatus(() => getCheckout(user.id), 409) ? 'pass' : 'fail'

    console.log(results)
    if (Object.values(results).some((result) => result !== 'pass')) process.exitCode = 1
  } finally {
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
