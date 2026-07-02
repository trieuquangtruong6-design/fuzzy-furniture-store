import { z } from 'zod'

const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^\+?[0-9][0-9 .()-]{7,19}$/,
    'Số điện thoại không đúng định dạng.',
  )

const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh phải có định dạng YYYY-MM-DD.')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
  }, 'Ngày sinh không hợp lệ.')
  .refine(
    (value) => new Date(`${value}T00:00:00.000Z`) <= new Date(),
    'Ngày sinh không được nằm trong tương lai.',
  )
  .transform((value) => new Date(`${value}T00:00:00.000Z`))

const avatarUrlSchema = z
  .string()
  .trim()
  .max(2048, 'Đường dẫn avatar quá dài.')
  .refine((value) => {
    if (value.startsWith('/') && !value.startsWith('//')) {
      return true
    }

    try {
      const url = new URL(value)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }, 'Avatar phải là URL HTTP(S) hoặc public path hợp lệ.')

export const updateProfileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Họ tên phải có ít nhất 2 ký tự.')
      .max(100, 'Họ tên không được vượt quá 100 ký tự.')
      .optional(),
    phone: phoneSchema.nullable().optional(),
    birthDate: birthDateSchema.nullable().optional(),
    avatarUrl: avatarUrlSchema.nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Cần cung cấp ít nhất một trường để cập nhật.',
  })

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
