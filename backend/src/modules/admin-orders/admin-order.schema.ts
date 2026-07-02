import { z } from 'zod'

export const updateAdminOrderStatusSchema = z.object({
  status: z.enum(['PREPARING', 'SHIPPING', 'COMPLETED', 'CANCELLED']),
  note: z.string().trim().max(500).nullable().optional(),
}).strict()

export type UpdateAdminOrderStatusInput = z.infer<typeof updateAdminOrderStatusSchema>

