import type { CreatedOrder } from './order'

export interface AdminOrder extends CreatedOrder {
  user: {
    id: string
    email: string
    fullName: string
    phone: string | null
  }
}

