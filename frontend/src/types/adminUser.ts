export interface AdminUser {
  id: string
  email: string
  fullName: string
  phone: string | null
  avatarUrl: string | null
  role: 'USER' | 'ADMIN'
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    orders: number
    addresses: number
    wishlistItems: number
  }
}
