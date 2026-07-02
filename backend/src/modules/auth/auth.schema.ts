import { z } from 'zod'

const emailSchema = z
  .string()
  .trim()
  .email('Email không đúng định dạng.')
  .max(254, 'Email quá dài.')
  .transform((email) => email.toLowerCase())

const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự.')
  .max(72, 'Mật khẩu không được vượt quá 72 ký tự.')
  .regex(/[a-z]/, 'Mật khẩu phải có chữ thường.')
  .regex(/[A-Z]/, 'Mật khẩu phải có chữ hoa.')
  .regex(/[0-9]/, 'Mật khẩu phải có chữ số.')

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z
    .string()
    .trim()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự.')
    .max(100, 'Họ tên không được vượt quá 100 ký tự.'),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mật khẩu không được để trống.'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
