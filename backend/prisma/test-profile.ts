import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../src/generated/prisma/client'

const baseUrl = 'http://127.0.0.1:3000'
const email = 'user@fuzzy.local'
const password = 'User@123456'
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
  const body = (await response.json()) as Record<string, unknown>

  assert(
    response.status === expectedStatus,
    `${path}: expected ${expectedStatus}, received ${response.status}`,
  )

  return { response, body }
}

async function main() {
  const original = await prisma.user.findUniqueOrThrow({
    where: { email },
    select: {
      id: true,
      fullName: true,
      phone: true,
      birthDate: true,
      avatarUrl: true,
    },
  })

  try {
    await request('/api/users/me', {}, 401)
    await request(
      '/api/users/me',
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fullName: 'Unauthorized Update' }),
      },
      401,
    )

    const login = await request(
      '/api/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      },
      200,
    )
    const setCookie = login.response.headers.get('set-cookie')
    assert(setCookie !== null, 'Login did not return an auth cookie')
    const cookie = setCookie.split(';', 1)[0]
    const authHeaders = { cookie }

    const profile = await request(
      '/api/users/me',
      { headers: authHeaders },
      200,
    )
    assert(
      !JSON.stringify(profile.body).includes('passwordHash'),
      'GET profile leaked passwordHash',
    )

    await request(
      '/api/users/me',
      {
        method: 'PATCH',
        headers: { ...authHeaders, 'content-type': 'application/json' },
        body: JSON.stringify({ phone: 'invalid' }),
      },
      400,
    )

    await request(
      '/api/users/me',
      {
        method: 'PATCH',
        headers: { ...authHeaders, 'content-type': 'application/json' },
        body: JSON.stringify({ role: 'ADMIN' }),
      },
      400,
    )

    const updated = await request(
      '/api/users/me',
      {
        method: 'PATCH',
        headers: { ...authHeaders, 'content-type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Fuzzy Profile Test',
          phone: '+84912345678',
          birthDate: '1995-06-15',
          avatarUrl: '/fuzzy/assets/images/profile/profile.png',
        }),
      },
      200,
    )
    assert(
      !JSON.stringify(updated.body).includes('passwordHash'),
      'PATCH profile leaked passwordHash',
    )

    const saved = await prisma.user.findUniqueOrThrow({
      where: { id: original.id },
      select: {
        fullName: true,
        phone: true,
        birthDate: true,
        avatarUrl: true,
        role: true,
        email: true,
      },
    })
    assert(saved.fullName === 'Fuzzy Profile Test', 'fullName was not updated')
    assert(saved.phone === '+84912345678', 'phone was not updated')
    assert(
      saved.birthDate?.toISOString().startsWith('1995-06-15'),
      'birthDate was not updated',
    )
    assert(
      saved.avatarUrl === '/fuzzy/assets/images/profile/profile.png',
      'avatarUrl was not updated',
    )
    assert(saved.email === email, 'email changed unexpectedly')
    assert(saved.role === 'USER', 'role changed unexpectedly')

    console.log({
      unauthenticatedGet: 'pass',
      unauthenticatedPatch: 'pass',
      getProfile: 'pass',
      invalidPhone: 'pass',
      protectedFields: 'pass',
      updateProfile: 'pass',
      databasePersistence: 'pass',
      passwordHashLeak: false,
    })
  } finally {
    await prisma.user.update({
      where: { id: original.id },
      data: {
        fullName: original.fullName,
        phone: original.phone,
        birthDate: original.birthDate,
        avatarUrl: original.avatarUrl,
      },
    })
  }
}

main()
  .catch((error: unknown) => {
    console.error('Profile smoke test failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
