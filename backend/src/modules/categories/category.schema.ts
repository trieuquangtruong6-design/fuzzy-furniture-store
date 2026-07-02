import { z } from 'zod'

const slugSchema = z
  .string()
  .trim()
  .min(2, 'Slug phải có ít nhất 2 ký tự.')
  .max(100, 'Slug không được vượt quá 100 ký tự.')
  .transform((slug) => slug.toLowerCase())
  .refine(
    (slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
    'Slug chỉ gồm chữ thường, số và dấu gạch ngang.',
  )

const imageUrlSchema = z
  .string()
  .trim()
  .max(2048, 'Đường dẫn ảnh quá dài.')
  .refine((value) => {
    if (value.startsWith('/') && !value.startsWith('//')) return true

    try {
      const url = new URL(value)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }, 'Ảnh phải là URL HTTP(S) hoặc public path hợp lệ.')

export const createCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Tên danh mục phải có ít nhất 2 ký tự.')
      .max(100, 'Tên danh mục không được vượt quá 100 ký tự.'),
    slug: slugSchema,
    imageUrl: imageUrlSchema.nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()

export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Tên danh mục phải có ít nhất 2 ký tự.')
      .max(100, 'Tên danh mục không được vượt quá 100 ký tự.')
      .optional(),
    slug: slugSchema.optional(),
    imageUrl: imageUrlSchema.nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Cần cung cấp ít nhất một trường để cập nhật.',
  })

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
