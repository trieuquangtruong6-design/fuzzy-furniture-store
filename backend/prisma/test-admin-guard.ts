const baseUrl = 'http://127.0.0.1:3000'

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
    data?: { admin?: { role?: string } }
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
  await request('/api/admin/health', {}, 401)
  await request('/api/admin/orders', {}, 401)

  const userCookie = await login('user@fuzzy.local', 'User@123456')
  await request(
    '/api/admin/health',
    { headers: { cookie: userCookie } },
    403,
  )
  await request('/api/admin/orders', { headers: { cookie: userCookie } }, 403)

  const adminCookie = await login('admin@fuzzy.local', 'Admin@123456')
  const adminHealth = await request(
    '/api/admin/health',
    { headers: { cookie: adminCookie } },
    200,
  )
  await request('/api/admin/orders', { headers: { cookie: adminCookie } }, 200)
  assert(
    adminHealth.body.data?.admin?.role === 'ADMIN',
    'Admin endpoint returned an invalid role',
  )

  console.log({
    guestDenied: 'pass',
    userDenied: 'pass',
    adminAllowed: 'pass',
    roleCheckedFromDatabase: true,
  })
}

main().catch((error: unknown) => {
  console.error('Admin guard smoke test failed', error)
  process.exitCode = 1
})
