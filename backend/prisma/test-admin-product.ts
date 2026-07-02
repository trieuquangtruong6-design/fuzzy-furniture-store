import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const baseUrl = 'http://127.0.0.1:3000'
const slug = 'admin-product-smoke'
const colorCode = 'SMOKE_COLOR'
const sizeCode = 'SMOKE_SIZE'
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not configured')
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

type Body = { data?: Record<string, unknown> }
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}
async function request(path: string, options: RequestInit, status: number) {
  const response = await fetch(`${baseUrl}${path}`, options)
  const body = (await response.json()) as Body
  assert(response.status === status, `${path}: expected ${status}, got ${response.status}`)
  return { response, body }
}
async function login(email: string, password: string) {
  const result = await request('/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }, 200)
  const value = result.response.headers.get('set-cookie')
  assert(value, 'Login cookie missing')
  return value.split(';', 1)[0]
}
function entity(body: Body, key: string) {
  const value = body.data?.[key] as Record<string, unknown> | undefined
  assert(value && typeof value.id === 'string', `${key} missing`)
  return value
}

async function main() {
  await prisma.product.deleteMany({ where: { slug } })
  await prisma.color.deleteMany({ where: { code: colorCode } })
  await prisma.size.deleteMany({ where: { code: sizeCode } })
  try {
    await request('/api/admin/products', {}, 401)
    const userCookie = await login('user@fuzzy.local', 'User@123456')
    await request('/api/admin/products', { headers: { cookie: userCookie } }, 403)
    const cookie = await login('admin@fuzzy.local', 'Admin@123456')
    const headers = { cookie, 'content-type': 'application/json' }

    const color = entity((await request('/api/admin/colors', {
      method: 'POST', headers,
      body: JSON.stringify({ name: 'Smoke Color', code: colorCode, hex: '#123456' }),
    }, 201)).body, 'color')
    await request('/api/admin/colors', {
      method: 'POST', headers,
      body: JSON.stringify({ name: 'Duplicate', code: colorCode, hex: '#654321' }),
    }, 409)
    const size = entity((await request('/api/admin/sizes', {
      method: 'POST', headers,
      body: JSON.stringify({ name: 'Smoke Size', code: sizeCode }),
    }, 201)).body, 'size')

    await request(`/api/admin/colors/${color.id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ hex: '#ABCDEF' }),
    }, 200)
    await request(`/api/admin/sizes/${size.id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ name: 'Smoke Size Updated' }),
    }, 200)

    const category = await prisma.category.findUniqueOrThrow({ where: { slug: 'chairs' } })
    await request('/api/admin/products', {
      method: 'POST', headers,
      body: JSON.stringify({
        categoryId: category.id, name: 'Invalid Price', slug: 'invalid-smoke-price',
        description: 'Invalid', price: '10.00', salePrice: '20.00',
        images: [{ imageUrl: '/fuzzy/assets/images/product/1.png', alt: 'Invalid', sortOrder: 0 }],
        variants: [{ sku: 'INVALID-SMOKE-SKU', stock: 1 }],
      }),
    }, 400)

    const product = entity((await request('/api/admin/products', {
      method: 'POST', headers,
      body: JSON.stringify({
        categoryId: category.id, name: 'Admin Product Smoke', slug,
        description: 'Temporary Admin Product fixture.', price: '100.00', salePrice: '80.00',
        isFeatured: true,
        images: [{ imageUrl: '/fuzzy/assets/images/product/1.png', alt: 'Smoke', sortOrder: 0 }],
        variants: [{ colorId: color.id, sizeId: size.id, sku: 'ADMIN-SMOKE-1', stock: 10 }],
      }),
    }, 201)).body, 'product')
    const images = product.images as Array<Record<string, unknown>>
    const variants = product.variants as Array<Record<string, unknown>>
    assert(images.length === 1 && variants.length === 1, 'Nested create failed')

    await request(`/api/admin/products/${product.id}`, { headers: { cookie } }, 200)
    await request(`/api/admin/products/${product.id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ price: '70.00' }),
    }, 400)
    await request(`/api/admin/products/${product.id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ price: '120.00', name: 'Admin Product Updated' }),
    }, 200)

    const image2 = entity((await request(`/api/admin/products/${product.id}/images`, {
      method: 'POST', headers,
      body: JSON.stringify({ imageUrl: '/fuzzy/assets/images/product/2.png', alt: 'Second', sortOrder: 1 }),
    }, 201)).body, 'image')
    await request(`/api/admin/products/${product.id}/images/${image2.id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ alt: 'Second Updated' }),
    }, 200)
    await request(`/api/admin/products/${product.id}/images/${images[0].id}`, {
      method: 'DELETE', headers: { cookie },
    }, 200)
    await request(`/api/admin/products/${product.id}/images/${image2.id}`, {
      method: 'DELETE', headers: { cookie },
    }, 400)

    const variant2 = entity((await request(`/api/admin/products/${product.id}/variants`, {
      method: 'POST', headers,
      body: JSON.stringify({ sku: 'ADMIN-SMOKE-2', stock: 4 }),
    }, 201)).body, 'variant')
    await request(`/api/admin/products/${product.id}/variants/${variant2.id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ stock: 7 }),
    }, 200)
    await request(`/api/admin/products/${product.id}/variants/${variants[0].id}`, {
      method: 'DELETE', headers: { cookie },
    }, 200)
    await request(`/api/admin/products/${product.id}/variants/${variant2.id}`, {
      method: 'DELETE', headers: { cookie },
    }, 400)

    const deletion = await request(`/api/admin/products/${product.id}`, {
      method: 'DELETE', headers: { cookie },
    }, 200)
    assert(deletion.body.data?.action === 'deleted', 'Unused product was not deleted')
    await request(`/api/admin/colors/${color.id}`, { method: 'DELETE', headers: { cookie } }, 200)
    await request(`/api/admin/sizes/${size.id}`, { method: 'DELETE', headers: { cookie } }, 200)

    console.log({
      authorization: 'pass', colorSizeCrud: 'pass', nestedProductCreate: 'pass',
      priceValidation: 'pass', productUpdate: 'pass', imageCrudAndMinimum: 'pass',
      variantCrudStockAndMinimum: 'pass', uniqueCode: 'pass', safeDelete: 'pass',
    })
  } finally {
    await prisma.product.deleteMany({ where: { slug: { in: [slug, 'invalid-smoke-price'] } } })
    await prisma.color.deleteMany({ where: { code: colorCode } })
    await prisma.size.deleteMany({ where: { code: sizeCode } })
  }
}
main().catch((error: unknown) => { console.error('Admin Product smoke test failed', error); process.exitCode = 1 })
  .finally(async () => prisma.$disconnect())
