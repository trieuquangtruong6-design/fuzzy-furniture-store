import bcrypt from 'bcryptjs'

import { ApiError } from '@/lib/api-response'
import { signAuthToken } from '@/lib/auth'
import prisma from '@/lib/prisma'
import type { LoginInput, RegisterInput } from '@/modules/auth/auth.schema'

const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  birthDate: true,
  avatarUrl: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const

export async function register(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  })

  if (existingUser) {
    throw new ApiError(409, 'Email đã được sử dụng.')
  }

  const passwordHash = await bcrypt.hash(input.password, 12)

  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.fullName,
      },
      select: publicUserSelect,
    })

    return { user, token: signAuthToken(user.id) }
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      throw new ApiError(409, 'Email đã được sử dụng.')
    }

    throw error
  }
}

export async function login(input: LoginInput) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email: input.email },
  })

  if (
    !userWithPassword ||
    !(await bcrypt.compare(input.password, userWithPassword.passwordHash))
  ) {
    throw new ApiError(401, 'Email hoặc mật khẩu không đúng.')
  }

  if (!userWithPassword.isActive) {
    throw new ApiError(403, 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.')
  }

  const user = {
    id: userWithPassword.id,
    email: userWithPassword.email,
    fullName: userWithPassword.fullName,
    phone: userWithPassword.phone,
    birthDate: userWithPassword.birthDate,
    avatarUrl: userWithPassword.avatarUrl,
    role: userWithPassword.role,
    isActive: userWithPassword.isActive,
    createdAt: userWithPassword.createdAt,
    updatedAt: userWithPassword.updatedAt,
  }

  return { user, token: signAuthToken(user.id) }
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  })

  if (!user) {
    throw new ApiError(401, 'Phiên đăng nhập không còn hợp lệ.')
  }

  return user
}
