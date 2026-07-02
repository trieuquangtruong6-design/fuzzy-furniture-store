import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../src/generated/prisma/client'

const webUrl = 'http://127.0.0.1:5173'
const email = 'web.integration@fuzzy.local'
const password = 'WebIntegration123'
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured')
}

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
  const response = await fetch(`${webUrl}${path}`, options)
  const body = (await response.json()) as {
    success: boolean
    data?: {
      user?: { fullName: string }
      address?: { id: string }
      addresses?: Array<{ id: string }>
    }
  }
  assert(
    response.status === expectedStatus,
    `${path}: expected ${expectedStatus}, received ${response.status}`,
  )
  return { response, body }
}

async function main() {
  await prisma.user.deleteMany({ where: { email } })

  try {
    const registration = await request(
      '/api/auth/register',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Web Integration',
          email,
          password,
        }),
      },
      201,
    )
    const setCookie = registration.response.headers.get('set-cookie')
    assert(setCookie !== null, 'Register did not return a cookie')
    assert(setCookie.includes('HttpOnly'), 'Frontend proxy lost HttpOnly cookie')
    const cookie = setCookie.split(';', 1)[0]
    const authHeaders = { cookie }
    const jsonAuthHeaders = { cookie, 'content-type': 'application/json' }

    const refreshedSession = await request(
      '/api/auth/me',
      { headers: authHeaders },
      200,
    )
    assert(
      refreshedSession.body.data?.user?.fullName === 'Web Integration',
      'Session bootstrap returned the wrong user',
    )

    const profile = await request(
      '/api/users/me',
      {
        method: 'PATCH',
        headers: jsonAuthHeaders,
        body: JSON.stringify({
          fullName: 'Web Integration Updated',
          phone: '+84912345678',
          birthDate: '1998-05-20',
          avatarUrl: '/fuzzy/assets/images/icons/profile1.png',
        }),
      },
      200,
    )
    assert(
      profile.body.data?.user?.fullName === 'Web Integration Updated',
      'Profile update through frontend proxy failed',
    )

    const created = await request(
      '/api/users/me/addresses',
      {
        method: 'POST',
        headers: jsonAuthHeaders,
        body: JSON.stringify({
          fullName: 'Web Integration Updated',
          phone: '+84912345678',
          province: 'Ho Chi Minh City',
          district: 'District 1',
          ward: 'Ben Nghe',
          detail: '10 Integration Street',
        }),
      },
      201,
    )
    const addressId = created.body.data?.address?.id
    assert(addressId, 'Address creation through frontend proxy failed')

    const addresses = await request(
      '/api/users/me/addresses',
      { headers: authHeaders },
      200,
    )
    assert(
      addresses.body.data?.addresses?.some((address) => address.id === addressId),
      'Address list through frontend proxy is missing the created address',
    )

    await request(
      `/api/users/me/addresses/${addressId}`,
      { method: 'DELETE', headers: authHeaders },
      200,
    )
    const logout = await request(
      '/api/auth/logout',
      { method: 'POST', headers: authHeaders },
      200,
    )
    assert(
      logout.response.headers.get('set-cookie')?.includes('Max-Age=0'),
      'Frontend proxy lost logout cookie expiration',
    )
    await request('/api/auth/me', {}, 401)

    console.log({
      frontendProxy: 'pass',
      register: 'pass',
      sessionRefresh: 'pass',
      profileUpdate: 'pass',
      addressCreateListDelete: 'pass',
      logout: 'pass',
      unauthenticatedAfterLogout: 'pass',
    })
  } finally {
    await prisma.user.deleteMany({ where: { email } })
  }
}

main()
  .catch((error: unknown) => {
    console.error('Web integration test failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
