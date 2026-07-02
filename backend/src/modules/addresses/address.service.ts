import { ApiError } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import type {
  CreateAddressInput,
  UpdateAddressInput,
} from '@/modules/addresses/address.schema'

const addressSelect = {
  id: true,
  fullName: true,
  phone: true,
  province: true,
  district: true,
  ward: true,
  detail: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} as const

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    select: addressSelect,
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  })
}

export async function createAddress(
  userId: string,
  input: CreateAddressInput,
) {
  return prisma.$transaction(async (tx) => {
    const addressCount = await tx.address.count({ where: { userId } })
    const shouldBeDefault = input.isDefault === true || addressCount === 0

    if (shouldBeDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    return tx.address.create({
      data: {
        userId,
        fullName: input.fullName,
        phone: input.phone,
        province: input.province,
        district: input.district,
        ward: input.ward,
        detail: input.detail,
        isDefault: shouldBeDefault,
      },
      select: addressSelect,
    })
  })
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: UpdateAddressInput,
) {
  return prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({
      where: { id: addressId, userId },
      select: { id: true, isDefault: true },
    })

    if (!address) {
      throw new ApiError(404, 'Không tìm thấy địa chỉ.')
    }

    if (address.isDefault && input.isDefault === false) {
      throw new ApiError(
        400,
        'Hãy chọn một địa chỉ khác làm mặc định trước.',
      )
    }

    if (input.isDefault === true) {
      await tx.address.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      })
    }

    return tx.address.update({
      where: { id: addressId },
      data: input,
      select: addressSelect,
    })
  })
}

export async function setDefaultAddress(userId: string, addressId: string) {
  return prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({
      where: { id: addressId, userId },
      select: { id: true },
    })

    if (!address) {
      throw new ApiError(404, 'Không tìm thấy địa chỉ.')
    }

    await tx.address.updateMany({
      where: { userId, isDefault: true, id: { not: addressId } },
      data: { isDefault: false },
    })

    return tx.address.update({
      where: { id: addressId },
      data: { isDefault: true },
      select: addressSelect,
    })
  })
}

export async function deleteAddress(userId: string, addressId: string) {
  return prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({
      where: { id: addressId, userId },
      select: { id: true, isDefault: true },
    })

    if (!address) {
      throw new ApiError(404, 'Không tìm thấy địa chỉ.')
    }

    await tx.address.delete({ where: { id: addressId } })

    if (address.isDefault) {
      const replacement = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      })

      if (replacement) {
        await tx.address.update({
          where: { id: replacement.id },
          data: { isDefault: true },
        })
      }
    }

    return { deleted: true }
  })
}
