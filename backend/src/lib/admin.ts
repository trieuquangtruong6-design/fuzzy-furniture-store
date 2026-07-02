import type { NextRequest } from 'next/server'

import { Role } from '@/generated/prisma/client'
import { ApiError } from '@/lib/api-response'
import { getAuthenticatedUserId } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function requireAdmin(request: NextRequest) {
  const userId = getAuthenticatedUserId(request)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  })

  if (!user) {
    throw new ApiError(401, 'Phiên đăng nhập không còn hợp lệ.')
  }

  if (user.role !== Role.ADMIN) {
    throw new ApiError(403, 'Bạn không có quyền truy cập chức năng này.')
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Tài khoản quản trị đã bị khóa.')
  }

  return user
}
