import { z } from 'zod'

export const createOrderSchema = z.object({
  addressId: z.string().trim().min(1),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER']),
  note: z.string().trim().max(500).nullable().optional(),
}).strict()

export const idempotencyKeySchema = z.string().trim().min(8).max(100)

export type CreateOrderInput = z.infer<typeof createOrderSchema>

