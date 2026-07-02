import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import prisma from '../src/lib/prisma'
import { ApiError } from '../src/lib/api-response'
import {
  addCartItem,
  clearCart,
  deleteCartItem,
  getCart,
  updateCartItem,
} from '../src/modules/cart/cart.service'
import { addCartItemSchema, updateCartItemSchema } from '../src/modules/cart/cart.schema'

const suffix = randomUUID().slice(0, 8)
const results: Record<string, string> = {}

async function expectApiError(action: () => Promise<unknown>, status: number) {
  try {
    await action()
    return false
  } catch (error) {
    return error instanceof ApiError && error.status === status
  }
}

async function main() {
  const category = await prisma.category.create({
    data: { name: `Cart Test ${suffix}`, slug: `cart-test-${suffix}` },
  })
  const product = await prisma.product.create({
    data: {
      categoryId: category.id,
      name: `Cart Product ${suffix}`,
      slug: `cart-product-${suffix}`,
      description: 'Temporary cart integration test product',
      price: '100.00',
      salePrice: '80.00',
      images: { create: { imageUrl: '/test-cart.png', alt: 'Cart test' } },
      variants: { create: { sku: `CART-${suffix}`, stock: 5, price: '75.00' } },
    },
    include: { variants: true },
  })
  const user = await prisma.user.create({
    data: {
      email: `cart-${suffix}@test.local`,
      passwordHash: 'test-only',
      fullName: 'Cart Test',
    },
  })
  const otherUser = await prisma.user.create({
    data: {
      email: `cart-other-${suffix}@test.local`,
      passwordHash: 'test-only',
      fullName: 'Other Cart Test',
    },
  })
  const variant = product.variants[0]

  try {
    results.inputValidation = !addCartItemSchema.safeParse({
      productId: product.id,
      variantId: variant.id,
      quantity: 0,
      price: '0.01',
    }).success && !updateCartItemSchema.safeParse({ quantity: -1 }).success ? 'pass' : 'fail'
    const empty = await getCart(user.id)
    results.emptyCart = empty.items.length === 0 ? 'pass' : 'fail'

    const added = await addCartItem(user.id, {
      productId: product.id,
      variantId: variant.id,
      quantity: 2,
    })
    results.addItem = added.items.length === 1 && added.itemCount === 2 ? 'pass' : 'fail'
    results.databasePrice = added.items[0]?.unitPrice === '75' && added.subtotal === '150' ? 'pass' : 'fail'

    const merged = await addCartItem(user.id, {
      productId: product.id,
      variantId: variant.id,
      quantity: 1,
    })
    results.mergeDuplicate = merged.items.length === 1 && merged.itemCount === 3 ? 'pass' : 'fail'
    results.overStockBlocked = await expectApiError(
      () => addCartItem(user.id, { productId: product.id, variantId: variant.id, quantity: 3 }),
      409,
    ) ? 'pass' : 'fail'
    results.invalidVariantBlocked = await expectApiError(
      () => addCartItem(otherUser.id, { productId: product.id, variantId: product.id, quantity: 1 }),
      400,
    ) ? 'pass' : 'fail'

    const itemId = merged.items[0]!.id
    const updated = await updateCartItem(user.id, itemId, 4)
    results.updateQuantity = updated.itemCount === 4 ? 'pass' : 'fail'
    results.ownership = await expectApiError(() => updateCartItem(otherUser.id, itemId, 1), 404) ? 'pass' : 'fail'

    await prisma.product.update({ where: { id: product.id }, data: { status: 'INACTIVE' } })
    results.inactiveBlocked = await expectApiError(
      () => addCartItem(otherUser.id, { productId: product.id, variantId: variant.id, quantity: 1 }),
      409,
    ) ? 'pass' : 'fail'
    await prisma.product.update({ where: { id: product.id }, data: { status: 'ACTIVE' } })

    const deleted = await deleteCartItem(user.id, itemId)
    results.deleteItem = deleted.items.length === 0 ? 'pass' : 'fail'
    await addCartItem(user.id, { productId: product.id, variantId: variant.id, quantity: 1 })
    const cleared = await clearCart(user.id)
    results.clearCart = cleared.items.length === 0 ? 'pass' : 'fail'
    console.log(results)
    if (Object.values(results).some((result) => result !== 'pass')) process.exitCode = 1
  } finally {
    await prisma.cart.deleteMany({ where: { userId: { in: [user.id, otherUser.id] } } })
    await prisma.user.deleteMany({ where: { id: { in: [user.id, otherUser.id] } } })
    await prisma.product.delete({ where: { id: product.id } })
    await prisma.category.delete({ where: { id: category.id } })
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
