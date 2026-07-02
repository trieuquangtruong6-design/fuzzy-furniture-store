import { z } from 'zod'

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined)

export const productListQuerySchema = z
  .object({
    cursor: optionalText(100),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    search: optionalText(100),
    category: optionalText(100),
    color: optionalText(50),
    size: optionalText(50),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    inStock: z.enum(['true', 'false']).optional(),
    sort: z
      .enum(['newest', 'price_asc', 'price_desc', 'name_asc'])
      .default('newest'),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: 'Giá tối thiểu không được lớn hơn giá tối đa.',
      path: ['minPrice'],
    },
  )

export const productLimitQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(24).default(8),
})

export type ProductListQuery = z.infer<typeof productListQuerySchema>
