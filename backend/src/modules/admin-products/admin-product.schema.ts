import { z } from 'zod'

const slug = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .transform((value) => value.toLowerCase())
  .refine((value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), 'Slug không hợp lệ.')

const money = z
  .string()
  .trim()
  .regex(/^\d{1,10}(?:\.\d{1,2})?$/, 'Giá tiền không hợp lệ.')
  .refine((value) => Number(value) >= 0, 'Giá tiền không được âm.')

const imageUrl = z.string().trim().min(1).max(2048).refine((value) => {
  if (value.startsWith('/') && !value.startsWith('//')) return true
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}, 'URL ảnh không hợp lệ.')

export const productImageSchema = z.object({
  imageUrl,
  alt: z.string().trim().min(1).max(200),
  sortOrder: z.number().int().min(0).default(0),
}).strict()

export const productVariantSchema = z.object({
  colorId: z.string().min(1).nullable().optional(),
  sizeId: z.string().min(1).nullable().optional(),
  sku: z.string().trim().min(2).max(100).transform((value) => value.toUpperCase()),
  price: money.nullable().optional(),
  stock: z.number().int().min(0),
}).strict()

const productCore = {
  categoryId: z.string().min(1),
  name: z.string().trim().min(2).max(200),
  slug,
  description: z.string().trim().min(1).max(10000),
  price: money,
  salePrice: money.nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
  isFeatured: z.boolean().optional(),
}

export const createProductSchema = z.object({
  ...productCore,
  images: z.array(productImageSchema).min(1),
  variants: z.array(productVariantSchema).min(1),
}).strict().refine(
  (data) => data.salePrice == null || Number(data.salePrice) <= Number(data.price),
  { message: 'Giá khuyến mãi không được lớn hơn giá gốc.', path: ['salePrice'] },
)

export const updateProductSchema = z.object({
  categoryId: productCore.categoryId.optional(),
  name: productCore.name.optional(),
  slug: productCore.slug.optional(),
  description: productCore.description.optional(),
  price: productCore.price.optional(),
  salePrice: productCore.salePrice,
  status: productCore.status,
  isFeatured: productCore.isFeatured,
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'Cần ít nhất một trường cập nhật.',
})

export const updateImageSchema = productImageSchema.partial().strict().refine(
  (data) => Object.keys(data).length > 0,
  'Cần ít nhất một trường cập nhật.',
)

export const updateVariantSchema = productVariantSchema.partial().strict().refine(
  (data) => Object.keys(data).length > 0,
  'Cần ít nhất một trường cập nhật.',
)

const attributeCode = z.string().trim().min(1).max(50).transform((value) => value.toUpperCase())

export const createColorSchema = z.object({
  name: z.string().trim().min(1).max(100),
  code: attributeCode,
  hex: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, 'Mã màu hex không hợp lệ.'),
}).strict()
export const updateColorSchema = createColorSchema.partial().strict().refine(
  (data) => Object.keys(data).length > 0,
  'Cần ít nhất một trường cập nhật.',
)
export const createSizeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  code: attributeCode,
}).strict()
export const updateSizeSchema = createSizeSchema.partial().strict().refine(
  (data) => Object.keys(data).length > 0,
  'Cần ít nhất một trường cập nhật.',
)

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductImageInput = z.infer<typeof productImageSchema>
export type ProductVariantInput = z.infer<typeof productVariantSchema>
