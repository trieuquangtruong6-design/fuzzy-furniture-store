import { ApiError } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import type {
  CreateProductInput,
  ProductImageInput,
  ProductVariantInput,
  UpdateProductInput,
} from '@/modules/admin-products/admin-product.schema'

const detailInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: {
    include: { color: true, size: true },
    orderBy: { createdAt: 'asc' as const },
  },
  _count: { select: { cartItems: true, orderItems: true } },
} as const

const serialize = <T>(value: T) => JSON.parse(JSON.stringify(value)) as unknown
const hasCode = (error: unknown, code: string) =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === code

function mapDatabaseError(error: unknown): never {
  if (hasCode(error, 'P2002')) throw new ApiError(409, 'Slug, SKU hoặc code đã tồn tại.')
  if (hasCode(error, 'P2003')) throw new ApiError(400, 'Category, Color hoặc Size không hợp lệ.')
  if (hasCode(error, 'P2025')) throw new ApiError(404, 'Không tìm thấy dữ liệu.')
  throw error
}

export async function listAdminProducts() {
  const products = await prisma.product.findMany({
    include: detailInclude,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
  return serialize(products)
}

export async function getAdminProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, include: detailInclude })
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm.')
  return serialize(product)
}

export async function createAdminProduct(input: CreateProductInput) {
  const { images, variants, ...product } = input
  try {
    const created = await prisma.$transaction((tx) =>
      tx.product.create({
        data: {
          ...product,
          images: { create: images },
          variants: { create: variants },
        },
        include: detailInclude,
      }),
    )
    return serialize(created)
  } catch (error) {
    mapDatabaseError(error)
  }
}

export async function updateAdminProduct(id: string, input: UpdateProductInput) {
  const current = await prisma.product.findUnique({
    where: { id },
    select: { price: true, salePrice: true },
  })
  if (!current) throw new ApiError(404, 'Không tìm thấy sản phẩm.')
  const price = Number(input.price ?? current.price)
  const salePrice = input.salePrice === undefined ? current.salePrice : input.salePrice
  if (salePrice != null && Number(salePrice) > price) {
    throw new ApiError(400, 'Giá khuyến mãi không được lớn hơn giá gốc.')
  }
  try {
    return serialize(await prisma.product.update({
      where: { id },
      data: input,
      include: detailInclude,
    }))
  } catch (error) {
    mapDatabaseError(error)
  }
}

export async function deleteOrHideProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, _count: { select: { orderItems: true } } },
  })
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm.')
  if (product._count.orderItems > 0) {
    await prisma.product.update({ where: { id }, data: { status: 'INACTIVE' } })
    return { action: 'hidden' as const }
  }
  await prisma.product.delete({ where: { id } })
  return { action: 'deleted' as const }
}

export async function addProductImage(productId: string, input: ProductImageInput) {
  try {
    return await prisma.productImage.create({ data: { productId, ...input } })
  } catch (error) { mapDatabaseError(error) }
}
export async function updateProductImage(productId: string, id: string, input: Partial<ProductImageInput>) {
  const image = await prisma.productImage.findFirst({ where: { id, productId } })
  if (!image) throw new ApiError(404, 'Không tìm thấy ảnh.')
  return prisma.productImage.update({ where: { id }, data: input })
}
export async function deleteProductImage(productId: string, id: string) {
  const count = await prisma.productImage.count({ where: { productId } })
  if (count <= 1) throw new ApiError(400, 'Sản phẩm phải có ít nhất một ảnh.')
  const result = await prisma.productImage.deleteMany({ where: { id, productId } })
  if (!result.count) throw new ApiError(404, 'Không tìm thấy ảnh.')
  return { deleted: true }
}

export async function addProductVariant(productId: string, input: ProductVariantInput) {
  try {
    return serialize(await prisma.productVariant.create({
      data: { productId, ...input },
      include: { color: true, size: true },
    }))
  } catch (error) { mapDatabaseError(error) }
}
export async function updateProductVariant(productId: string, id: string, input: Partial<ProductVariantInput>) {
  const variant = await prisma.productVariant.findFirst({ where: { id, productId } })
  if (!variant) throw new ApiError(404, 'Không tìm thấy variant.')
  try {
    return serialize(await prisma.productVariant.update({
      where: { id }, data: input, include: { color: true, size: true },
    }))
  } catch (error) { mapDatabaseError(error) }
}
export async function deleteProductVariant(productId: string, id: string) {
  const count = await prisma.productVariant.count({ where: { productId } })
  if (count <= 1) throw new ApiError(400, 'Sản phẩm phải có ít nhất một variant.')
  try {
    await prisma.productVariant.delete({ where: { id, productId } })
    return { deleted: true }
  } catch (error) { mapDatabaseError(error) }
}

export async function listColors() { return prisma.color.findMany({ orderBy: { name: 'asc' } }) }
export async function listSizes() { return prisma.size.findMany({ orderBy: { name: 'asc' } }) }
export async function createColor(data: { name: string; code: string; hex: string }) {
  try { return await prisma.color.create({ data }) } catch (error) { mapDatabaseError(error) }
}
export async function updateColor(id: string, data: { name?: string; code?: string; hex?: string }) {
  try { return await prisma.color.update({ where: { id }, data }) } catch (error) { mapDatabaseError(error) }
}
export async function deleteColor(id: string) {
  try { await prisma.color.delete({ where: { id } }); return { deleted: true } } catch (error) { mapDatabaseError(error) }
}
export async function createSize(data: { name: string; code: string }) {
  try { return await prisma.size.create({ data }) } catch (error) { mapDatabaseError(error) }
}
export async function updateSize(id: string, data: { name?: string; code?: string }) {
  try { return await prisma.size.update({ where: { id }, data }) } catch (error) { mapDatabaseError(error) }
}
export async function deleteSize(id: string) {
  try { await prisma.size.delete({ where: { id } }); return { deleted: true } } catch (error) { mapDatabaseError(error) }
}
