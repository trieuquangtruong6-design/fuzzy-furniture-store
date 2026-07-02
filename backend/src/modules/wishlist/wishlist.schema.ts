import { z } from 'zod'

export const addWishlistItemSchema = z.object({
  productId: z.string().trim().min(1),
}).strict()
