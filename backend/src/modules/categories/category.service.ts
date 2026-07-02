import { ApiError } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/modules/categories/category.schema'

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  imageUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { products: true } },
} as const

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  )
}

export async function listPublicCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    select: categorySelect,
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
  })
}

export async function getPublicCategory(slug: string) {
  const category = await prisma.category.findFirst({
    where: { slug, isActive: true },
    select: categorySelect,
  })

  if (!category) throw new ApiError(404, 'Không tìm thấy danh mục.')
  return category
}

export async function listAdminCategories() {
  return prisma.category.findMany({
    select: categorySelect,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
}

export async function getAdminCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    select: categorySelect,
  })

  if (!category) throw new ApiError(404, 'Không tìm thấy danh mục.')
  return category
}

export async function createCategory(input: CreateCategoryInput) {
  try {
    return await prisma.category.create({
      data: input,
      select: categorySelect,
    })
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ApiError(409, 'Slug danh mục đã được sử dụng.')
    }
    throw error
  }
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
) {
  try {
    return await prisma.category.update({
      where: { id },
      data: input,
      select: categorySelect,
    })
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ApiError(409, 'Slug danh mục đã được sử dụng.')
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      throw new ApiError(404, 'Không tìm thấy danh mục.')
    }
    throw error
  }
}

export async function deleteOrHideCategory(id: string) {
  return prisma.$transaction(async (tx) => {
    const category = await tx.category.findUnique({
      where: { id },
      select: {
        id: true,
        _count: { select: { products: true } },
      },
    })

    if (!category) throw new ApiError(404, 'Không tìm thấy danh mục.')

    if (category._count.products > 0) {
      const hidden = await tx.category.update({
        where: { id },
        data: { isActive: false },
        select: categorySelect,
      })
      return { action: 'hidden' as const, category: hidden }
    }

    await tx.category.delete({ where: { id } })
    return { action: 'deleted' as const, category: null }
  })
}
