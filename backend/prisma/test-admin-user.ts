export {}

const baseUrl = 'http://127.0.0.1:3000'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

async function request(path: string, options: RequestInit, expected: number) {
  const response = await fetch(`${baseUrl}${path}`, options)
  const body = await response.json() as {
    success: boolean
    data?: { users?: Array<{ id: string; email: string }>; user?: { isActive: boolean } }
  }
  assert(response.status === expected, `${path}: expected ${expected}, got ${response.status}`)
  return { response, body }
}

async function login(email: string, password: string, expected = 200) {
  const result = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }, expected)
  if (expected !== 200) return ''
  const cookie = result.response.headers.get('set-cookie')
  assert(cookie, 'Login cookie missing')
  return cookie.split(';', 1)[0]
}

async function main() {
  await request('/api/admin/users', {}, 401)
  const userCookie = await login('user@fuzzy.local', 'User@123456')
  await request('/api/admin/users', { headers: { cookie: userCookie } }, 403)

  const adminCookie = await login('admin@fuzzy.local', 'Admin@123456')
  const list = await request('/api/admin/users', { headers: { cookie: adminCookie } }, 200)
  const admin = list.body.data?.users?.find((user) => user.email === 'admin@fuzzy.local')
  const user = list.body.data?.users?.find((entry) => entry.email === 'user@fuzzy.local')
  assert(admin && user, 'Seed users missing')

  await request(`/api/admin/users/${admin.id}`, {
    method: 'PATCH',
    headers: { cookie: adminCookie, 'content-type': 'application/json' },
    body: JSON.stringify({ isActive: false }),
  }, 409)

  let locked = false
  try {
    await request(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { cookie: adminCookie, 'content-type': 'application/json' },
      body: JSON.stringify({ isActive: false }),
    }, 200)
    locked = true
    await login('user@fuzzy.local', 'User@123456', 403)
  } finally {
    if (locked) {
      await request(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { cookie: adminCookie, 'content-type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      }, 200)
    }
  }
  await login('user@fuzzy.local', 'User@123456')

  console.log({
    guestDenied: 'pass',
    userDenied: 'pass',
    adminList: 'pass',
    selfProtection: 'pass',
    lockAndLoginGuard: 'pass',
    userRestored: 'pass',
  })
}

main().catch((error) => {
  console.error('Admin user smoke test failed', error)
  process.exitCode = 1
})
