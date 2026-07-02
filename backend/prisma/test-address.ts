import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../src/generated/prisma/client'

const baseUrl = 'http://127.0.0.1:3000'
const testEmail = 'address.smoke@fuzzy.local'
const testPassword = 'AddressTest123'
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

async function request(
  path: string,
  options: RequestInit = {},
  expectedStatus: number,
) {
  const response = await fetch(`${baseUrl}${path}`, options)
  const body = (await response.json()) as {
    success: boolean
    data?: {
      address?: { id: string; detail: string; isDefault: boolean }
      addresses?: Array<{ id: string; isDefault: boolean }>
    }
  }

  assert(
    response.status === expectedStatus,
    `${path}: expected ${expectedStatus}, received ${response.status}`,
  )

  return { response, body }
}

function cookieFrom(response: Response) {
  const setCookie = response.headers.get('set-cookie')
  assert(setCookie !== null, 'Authentication did not return a cookie')
  return setCookie.split(';', 1)[0]
}

async function main() {
  await prisma.user.deleteMany({ where: { email: testEmail } })

  try {
    await request('/api/users/me/addresses', {}, 401)

    const registration = await request(
      '/api/auth/register',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          fullName: 'Address Smoke',
        }),
      },
      201,
    )
    const userCookie = cookieFrom(registration.response)
    const userHeaders = {
      cookie: userCookie,
      'content-type': 'application/json',
    }

    await request(
      '/api/users/me/addresses',
      {
        method: 'POST',
        headers: userHeaders,
        body: JSON.stringify({ fullName: '' }),
      },
      400,
    )

    const first = await request(
      '/api/users/me/addresses',
      {
        method: 'POST',
        headers: userHeaders,
        body: JSON.stringify({
          fullName: 'Address Smoke',
          phone: '+84912345678',
          province: 'Ho Chi Minh City',
          district: 'District 1',
          ward: 'Ben Nghe',
          detail: '1 First Street',
        }),
      },
      201,
    )
    const firstAddress = first.body.data?.address
    assert(firstAddress, 'First address was not returned')
    assert(firstAddress.isDefault, 'First address was not set as default')

    const second = await request(
      '/api/users/me/addresses',
      {
        method: 'POST',
        headers: userHeaders,
        body: JSON.stringify({
          fullName: 'Address Smoke',
          phone: '+84987654321',
          province: 'Ha Noi',
          district: 'Ba Dinh',
          ward: 'Dien Bien',
          detail: '2 Second Street',
          isDefault: false,
        }),
      },
      201,
    )
    const secondAddress = second.body.data?.address
    assert(secondAddress, 'Second address was not returned')
    assert(!secondAddress.isDefault, 'Second address unexpectedly became default')

    const list = await request(
      '/api/users/me/addresses',
      { headers: { cookie: userCookie } },
      200,
    )
    assert(list.body.data?.addresses?.length === 2, 'Address list is incorrect')

    const updated = await request(
      `/api/users/me/addresses/${secondAddress.id}`,
      {
        method: 'PATCH',
        headers: userHeaders,
        body: JSON.stringify({ detail: '2 Updated Street' }),
      },
      200,
    )
    assert(
      updated.body.data?.address?.detail === '2 Updated Street',
      'Address update was not persisted',
    )

    await request(
      `/api/users/me/addresses/${secondAddress.id}/default`,
      { method: 'PATCH', headers: { cookie: userCookie } },
      200,
    )

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: testEmail },
      select: { id: true },
    })
    const defaultCount = await prisma.address.count({
      where: { userId: user.id, isDefault: true },
    })
    assert(defaultCount === 1, 'User has more than one default address')

    const adminLogin = await request(
      '/api/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@fuzzy.local',
          password: 'Admin@123456',
        }),
      },
      200,
    )
    const adminCookie = cookieFrom(adminLogin.response)
    const adminHeaders = {
      cookie: adminCookie,
      'content-type': 'application/json',
    }

    await request(
      `/api/users/me/addresses/${secondAddress.id}`,
      {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ detail: 'Unauthorized update' }),
      },
      404,
    )
    await request(
      `/api/users/me/addresses/${secondAddress.id}`,
      { method: 'DELETE', headers: { cookie: adminCookie } },
      404,
    )

    await request(
      `/api/users/me/addresses/${secondAddress.id}`,
      { method: 'DELETE', headers: { cookie: userCookie } },
      200,
    )
    const promoted = await prisma.address.findUniqueOrThrow({
      where: { id: firstAddress.id },
      select: { isDefault: true },
    })
    assert(promoted.isDefault, 'Oldest address was not promoted after deletion')

    await request(
      `/api/users/me/addresses/${firstAddress.id}`,
      { method: 'DELETE', headers: { cookie: userCookie } },
      200,
    )

    console.log({
      unauthenticated: 'pass',
      validation: 'pass',
      create: 'pass',
      list: 'pass',
      update: 'pass',
      setDefault: 'pass',
      singleDefault: 'pass',
      ownership: 'pass',
      delete: 'pass',
      defaultReplacement: 'pass',
    })
  } finally {
    await prisma.user.deleteMany({ where: { email: testEmail } })
  }
}

main()
  .catch((error: unknown) => {
    console.error('Address smoke test failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
