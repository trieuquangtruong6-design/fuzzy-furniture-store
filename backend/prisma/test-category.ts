import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../src/generated/prisma/client'

const baseUrl = 'http://127.0.0.1:3000'
const testSlugs = ['category-smoke', 'category-hard-delete']
const connectionString = process.env.DATABASE_URL

if (!connectionString) throw new Error('DATABASE_URL is not configured')

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

async function request(
  path: string,
  options: RequestInit,
  expectedStatus: number,
) {
  const response = await fetch(`${baseUrl}${path}`, options)
  const body = (await response.json()) as {
    success: boolean
    data?: {
      category?: { id: string; name: string; slug: string; isActive: boolean }
      categories?: Array<{ slug: string; isActive: boolean }>
      action?: string
    }
  }
  assert(
    response.status === expectedStatus,
    `${path}: expected ${expectedStatus}, received ${response.status}`,
  )
  return { response, body }
}

async function login(email: string, password: string) {
  const result = await request(
    '/api/auth/login',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    },
    200,
  )
  const setCookie = result.response.headers.get('set-cookie')
  assert(setCookie !== null, 'Login did not return an auth cookie')
  return setCookie.split(';', 1)[0]
}

async function main() {
  await prisma.product.deleteMany({
    where: { slug: 'category-smoke-product' },
  })
  await prisma.category.deleteMany({ where: { slug: { in: testSlugs } } })

  try {
    await request('/api/admin/categories', {}, 401)

    const userCookie = await login('user@fuzzy.local', 'User@123456')
    await request(
      '/api/admin/categories',
      {
        method: 'POST',
        headers: {
          cookie: userCookie,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Forbidden Category',
          slug: 'forbidden-category',
        }),
      },
      403,
    )

    const adminCookie = await login('admin@fuzzy.local', 'Admin@123456')
    const adminHeaders = {
      cookie: adminCookie,
      'content-type': 'application/json',
    }

    const created = await request(
      '/api/admin/categories',
      {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          name: 'Category Smoke',
          slug: 'CATEGORY-SMOKE',
          imageUrl: '/fuzzy/assets/images/product/1.png',
        }),
      },
      201,
    )
    const category = created.body.data?.category
    assert(category, 'Created category was not returned')
    assert(category.slug === 'category-smoke', 'Slug was not normalized')

    await request(
      '/api/admin/categories',
      {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          name: 'Duplicate Category',
          slug: 'category-smoke',
        }),
      },
      409,
    )

    await request('/api/categories/category-smoke', {}, 200)
    const publicList = await request('/api/categories', {}, 200)
    assert(
      publicList.body.data?.categories?.some(
        (item) => item.slug === 'category-smoke',
      ),
      'Active category is missing from public list',
    )

    const updated = await request(
      `/api/admin/categories/${category.id}`,
      {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ name: 'Category Smoke Updated' }),
      },
      200,
    )
    assert(
      updated.body.data?.category?.name === 'Category Smoke Updated',
      'Category update failed',
    )

    await prisma.product.create({
      data: {
        categoryId: category.id,
        name: 'Category Smoke Product',
        slug: 'category-smoke-product',
        description: 'Temporary product used to verify category soft deletion.',
        price: '10.00',
      },
    })
    const hidden = await request(
      `/api/admin/categories/${category.id}`,
      { method: 'DELETE', headers: { cookie: adminCookie } },
      200,
    )
    assert(hidden.body.data?.action === 'hidden', 'Used category was not hidden')
    await request('/api/categories/category-smoke', {}, 404)

    const hardDeleteCreated = await request(
      '/api/admin/categories',
      {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          name: 'Category Hard Delete',
          slug: 'category-hard-delete',
        }),
      },
      201,
    )
    const hardDeleteId = hardDeleteCreated.body.data?.category?.id
    assert(hardDeleteId, 'Hard-delete category was not returned')
    const deleted = await request(
      `/api/admin/categories/${hardDeleteId}`,
      { method: 'DELETE', headers: { cookie: adminCookie } },
      200,
    )
    assert(
      deleted.body.data?.action === 'deleted',
      'Unused category was not deleted',
    )

    console.log({
      publicListAndDetail: 'pass',
      guestDenied: 'pass',
      userDenied: 'pass',
      adminCreate: 'pass',
      slugNormalizationAndUniqueness: 'pass',
      adminUpdate: 'pass',
      usedCategoryHidden: 'pass',
      unusedCategoryDeleted: 'pass',
    })
  } finally {
    await prisma.product.deleteMany({
      where: { slug: 'category-smoke-product' },
    })
    await prisma.category.deleteMany({ where: { slug: { in: testSlugs } } })
    await prisma.category.deleteMany({ where: { slug: 'forbidden-category' } })
  }
}

main()
  .catch((error: unknown) => {
    console.error('Category smoke test failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
