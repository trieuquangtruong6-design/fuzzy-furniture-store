import { z } from 'zod'

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} không được để trống.`)
    .max(max, `${label} không được vượt quá ${max} ký tự.`)

const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^\+?[0-9][0-9 .()-]{7,19}$/,
    'Số điện thoại không đúng định dạng.',
  )

const addressFields = {
  fullName: requiredText('Họ tên', 100),
  phone: phoneSchema,
  province: requiredText('Tỉnh/thành phố', 100),
  district: requiredText('Quận/huyện', 100),
  ward: requiredText('Phường/xã', 100),
  detail: requiredText('Địa chỉ chi tiết', 255),
  isDefault: z.boolean().optional(),
}

export const createAddressSchema = z.object(addressFields).strict()

export const updateAddressSchema = z
  .object({
    fullName: addressFields.fullName.optional(),
    phone: addressFields.phone.optional(),
    province: addressFields.province.optional(),
    district: addressFields.district.optional(),
    ward: addressFields.ward.optional(),
    detail: addressFields.detail.optional(),
    isDefault: addressFields.isDefault,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Cần cung cấp ít nhất một trường để cập nhật.',
  })

export type CreateAddressInput = z.infer<typeof createAddressSchema>
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>
