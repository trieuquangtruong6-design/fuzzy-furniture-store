import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../src/generated/prisma/client'

const baseUrl = 'http://127.0.0.1:3000'
const testEmail = 'auth.smoke@fuzzy.local'
const testPassword = 'AuthTest123'
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
  await prisma.user.deleteMany({ where: { email: testEmail } })

  try {
    await request('/api/auth/me', {}, 401)

    await request(
      '/api/auth/register',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'weak',
          fullName: 'Auth Smoke',
        }),
      },
      400,
    )

    const registered = await request(
      '/api/auth/register',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          fullName: 'Auth Smoke',
        }),
      },
      201,
    )

    const registerCookie = registered.response.headers.get('set-cookie')
    assert(registerCookie?.includes('HttpOnly'), 'Register cookie is not HttpOnly')
    assert(
      !JSON.stringify(registered.body).includes('passwordHash'),
      'Register response leaked passwordHash',
    )

    await request(
      '/api/auth/register',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          fullName: 'Auth Smoke',
        }),
      },
      409,
    )

    await request(
      '/api/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'WrongPassword123',
        }),
      },
      401,
    )

    const loggedIn = await request(
      '/api/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      },
      200,
    )

    const setCookie = loggedIn.response.headers.get('set-cookie')
    assert(setCookie !== null, 'Login did not return an auth cookie')
    assert(setCookie.includes('HttpOnly'), 'Login cookie is not HttpOnly')
    assert(
      !JSON.stringify(loggedIn.body).includes('passwordHash'),
      'Login response leaked passwordHash',
    )

    const cookie = setCookie.split(';', 1)[0]
    const currentUser = await request(
      '/api/auth/me',
      { headers: { cookie } },
      200,
    )
    assert(
      !JSON.stringify(currentUser.body).includes('passwordHash'),
      '/me response leaked passwordHash',
    )

    const loggedOut = await request(
      '/api/auth/logout',
      { method: 'POST', headers: { cookie } },
      200,
    )
    assert(
      loggedOut.response.headers.get('set-cookie')?.includes('Max-Age=0'),
      'Logout did not expire the auth cookie',
    )

    await request('/api/auth/me', {}, 401)

    console.log({
      unauthenticatedMe: 'pass',
      weakPassword: 'pass',
      register: 'pass',
      duplicateEmail: 'pass',
      wrongPassword: 'pass',
      login: 'pass',
      authenticatedMe: 'pass',
      logout: 'pass',
      passwordHashLeak: false,
    })
  } finally {
    await prisma.user.deleteMany({ where: { email: testEmail } })
  }
}

main()
  .catch((error: unknown) => {
    console.error('Auth smoke test failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
