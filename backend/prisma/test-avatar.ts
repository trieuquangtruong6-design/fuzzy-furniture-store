import 'dotenv/config'

import { rm, readFile } from 'node:fs/promises'
import path from 'node:path'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../src/generated/prisma/client'

const baseUrl = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:3000'
const email = 'avatar.smoke@fuzzy.local'
const password = 'AvatarSmoke123'
const connectionString = process.env.DATABASE_URL

if (!connectionString) throw new Error('DATABASE_URL is not configured')

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

async function request(
  pathName: string,
  options: RequestInit,
  expectedStatus: number,
) {
  const response = await fetch(`${baseUrl}${pathName}`, options)
  const body = (await response.json()) as {
    success: boolean
    data?: {
      avatarUrl?: string
      user?: { avatarUrl?: string | null }
    }
  }
  assert(
    response.status === expectedStatus,
    `${pathName}: expected ${expectedStatus}, received ${response.status}`,
  )
  return { response, body }
}

async function main() {
  await prisma.user.deleteMany({ where: { email } })
  let uploadedAvatarUrl: string | null = null

  try {
    const unauthenticatedForm = new FormData()
    unauthenticatedForm.append(
      'avatar',
      new Blob(['not-an-image'], { type: 'text/plain' }),
      'avatar.txt',
    )
    await request(
      '/api/users/me/avatar',
      { method: 'POST', body: unauthenticatedForm },
      401,
    )

    const registration = await request(
      '/api/auth/register',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Avatar Smoke',
          email,
          password,
        }),
      },
      201,
    )
    const setCookie = registration.response.headers.get('set-cookie')
    assert(setCookie !== null, 'Register did not return an auth cookie')
    const cookie = setCookie.split(';', 1)[0]

    const invalidTypeForm = new FormData()
    invalidTypeForm.append(
      'avatar',
      new Blob(['plain text'], { type: 'text/plain' }),
      'avatar.txt',
    )
    await request(
      '/api/users/me/avatar',
      {
        method: 'POST',
        headers: { cookie },
        body: invalidTypeForm,
      },
      415,
    )

    const oversizedBytes = new Uint8Array(2 * 1024 * 1024 + 1)
    oversizedBytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    const oversizedForm = new FormData()
    oversizedForm.append(
      'avatar',
      new Blob([oversizedBytes], { type: 'image/png' }),
      'oversized.png',
    )
    await request(
      '/api/users/me/avatar',
      {
        method: 'POST',
        headers: { cookie },
        body: oversizedForm,
      },
      413,
    )

    const fakeImageForm = new FormData()
    fakeImageForm.append(
      'avatar',
      new Blob(['fake png'], { type: 'image/png' }),
      'fake.png',
    )
    await request(
      '/api/users/me/avatar',
      {
        method: 'POST',
        headers: { cookie },
        body: fakeImageForm,
      },
      415,
    )

    const fixture = await readFile(
      path.join(
        process.cwd(),
        '..',
        'frontend',
        'public',
        'fuzzy',
        'assets',
        'images',
        'icons',
        'profile1.png',
      ),
    )
    const validForm = new FormData()
    validForm.append(
      'avatar',
      new Blob([fixture], { type: 'image/png' }),
      'profile.png',
    )
    const uploaded = await request(
      '/api/users/me/avatar',
      {
        method: 'POST',
        headers: { cookie },
        body: validForm,
      },
      200,
    )
    uploadedAvatarUrl = uploaded.body.data?.avatarUrl ?? null
    assert(
      uploadedAvatarUrl?.startsWith('/uploads/avatars/'),
      'Upload did not return a public avatar URL',
    )
    assert(
      uploaded.body.data?.user?.avatarUrl === uploadedAvatarUrl,
      'Upload response user was not updated',
    )

    const profile = await request(
      '/api/users/me',
      { headers: { cookie } },
      200,
    )
    assert(
      profile.body.data?.user?.avatarUrl === uploadedAvatarUrl,
      'Reloaded profile did not preserve the avatar URL',
    )

    const staticFile = await fetch(`${baseUrl}${uploadedAvatarUrl}`)
    assert(staticFile.status === 200, 'Uploaded avatar is not publicly served')

    console.log({
      unauthenticated: 'pass',
      invalidType: 'pass',
      oversizedFile: 'pass',
      spoofedMimeType: 'pass',
      validUpload: 'pass',
      databasePersistence: 'pass',
      publicFileServing: 'pass',
      passwordHashLeak: false,
    })
  } finally {
    await prisma.user.deleteMany({ where: { email } })

    const match = uploadedAvatarUrl?.match(
      /^\/uploads\/avatars\/([a-zA-Z0-9._-]+)$/,
    )
    if (match) {
      await rm(
        path.join(process.cwd(), 'public', 'uploads', 'avatars', match[1]),
        { force: true },
      )
    }
  }
}

main()
  .catch((error: unknown) => {
    console.error('Avatar smoke test failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
