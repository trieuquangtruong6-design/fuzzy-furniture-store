import { ApiError } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import type { UpdateProfileInput } from '@/modules/users/user.schema'

export const profileSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  birthDate: true,
  avatarUrl: true,
  role: true,
  isActive: true,
} as const

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  })

  if (!user) {
    throw new ApiError(401, 'Phiên đăng nhập không còn hợp lệ.')
  }

  return user
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
) {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: input,
      select: profileSelect,
    })
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      throw new ApiError(401, 'Phiên đăng nhập không còn hợp lệ.')
    }

    throw error
  }
}

export async function updateAvatar(userId: string, avatarUrl: string) {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: profileSelect,
    })
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      throw new ApiError(401, 'Phiên đăng nhập không còn hợp lệ.')
    }

    throw error
  }
}
