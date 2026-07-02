export interface User {
  id: string
  email: string
  fullName: string
  phone: string | null
  birthDate: string | null
  avatarUrl: string | null
  role: 'USER' | 'ADMIN'
  isActive: boolean
}

export interface Address {
  id: string
  fullName: string
  phone: string
  province: string
  district: string
  ward: string
  detail: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface AddressInput {
  fullName: string
  phone: string
  province: string
  district: string
  ward: string
  detail: string
  isDefault?: boolean
}
