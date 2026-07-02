import { z } from 'zod'

export const addCartItemSchema = z.object({
  productId: z.string().trim().min(1),
  variantId: z.string().trim().min(1),
  quantity: z.number().int().min(1),
}).strict()

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
}).strict()

export type AddCartItemInput = z.infer<typeof addCartItemSchema>

