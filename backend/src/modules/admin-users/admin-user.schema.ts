import { z } from 'zod'

export const updateAdminUserSchema = z.object({
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
}).strict().refine(
  (data) => data.role !== undefined || data.isActive !== undefined,
  'Cần có ít nhất một thay đổi.',
)

export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>
