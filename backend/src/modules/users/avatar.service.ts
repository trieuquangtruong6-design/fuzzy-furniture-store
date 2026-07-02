import { randomUUID } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { ApiError } from '@/lib/api-response'
import { getProfile, updateAvatar } from '@/modules/users/user.service'

export const MAX_AVATAR_SIZE = 2 * 1024 * 1024

const avatarTypes = {
  'image/jpeg': {
    extension: 'jpg',
    matches: (bytes: Uint8Array) =>
      bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  'image/png': {
    extension: 'png',
    matches: (bytes: Uint8Array) =>
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a,
  },
  'image/webp': {
    extension: 'webp',
    matches: (bytes: Uint8Array) =>
      String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP',
  },
} as const

type SupportedAvatarType = keyof typeof avatarTypes

function uploadedAvatarPath(avatarUrl: string | null) {
  if (!avatarUrl) return null
  const match = avatarUrl.match(/^\/uploads\/avatars\/([a-zA-Z0-9._-]+)$/)
  if (!match) return null
  return path.join(process.cwd(), 'public', 'uploads', 'avatars', match[1])
}

export async function saveAvatar(userId: string, file: File) {
  if (!(file.type in avatarTypes)) {
    throw new ApiError(
      415,
      'Avatar chỉ hỗ trợ định dạng JPEG, PNG hoặc WebP.',
    )
  }

  if (file.size === 0) {
    throw new ApiError(400, 'File avatar không được để trống.')
  }

  if (file.size > MAX_AVATAR_SIZE) {
    throw new ApiError(413, 'Avatar không được vượt quá 2MB.')
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const type = file.type as SupportedAvatarType
  const config = avatarTypes[type]

  if (!config.matches(bytes)) {
    throw new ApiError(415, 'Nội dung file không đúng định dạng ảnh đã khai báo.')
  }

  const currentUser = await getProfile(userId)
  const directory = path.join(process.cwd(), 'public', 'uploads', 'avatars')
  const filename = `${userId}-${Date.now()}-${randomUUID()}.${config.extension}`
  const filePath = path.join(directory, filename)
  const avatarUrl = `/uploads/avatars/${filename}`

  await mkdir(directory, { recursive: true })
  await writeFile(filePath, bytes, { flag: 'wx' })

  try {
    const user = await updateAvatar(userId, avatarUrl)
    const oldFilePath = uploadedAvatarPath(currentUser.avatarUrl)

    if (oldFilePath && oldFilePath !== filePath) {
      await rm(oldFilePath, { force: true }).catch(() => undefined)
    }

    return { avatarUrl, user }
  } catch (error) {
    await rm(filePath, { force: true }).catch(() => undefined)
    throw error
  }
}
