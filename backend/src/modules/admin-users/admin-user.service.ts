import { Role } from '@/generated/prisma/client'
import { ApiError } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import type { UpdateAdminUserInput } from './admin-user.schema'

const userSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  avatarUrl: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      orders: true,
      addresses: true,
      wishlistItems: true,
    },
  },
} as const

export function listAdminUsers() {
  return prisma.user.findMany({
    select: userSelect,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
}

export async function updateAdminUser(
  actorId: string,
  targetId: string,
  input: UpdateAdminUserInput,
) {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true, isActive: true },
  })
  if (!target) throw new ApiError(404, 'Không tìm thấy người dùng.')

  if (actorId === targetId && (input.role === Role.USER || input.isActive === false)) {
    throw new ApiError(409, 'Bạn không thể hạ quyền hoặc khóa chính tài khoản đang sử dụng.')
  }

  const removesActiveAdmin =
    target.role === Role.ADMIN &&
    target.isActive &&
    (input.role === Role.USER || input.isActive === false)

  if (removesActiveAdmin) {
    const activeAdmins = await prisma.user.count({
      where: { role: Role.ADMIN, isActive: true },
    })
    if (activeAdmins <= 1) {
      throw new ApiError(409, 'Hệ thống phải còn ít nhất một quản trị viên hoạt động.')
    }
  }

  return prisma.user.update({
    where: { id: targetId },
    data: input,
    select: userSelect,
  })
}
