export interface AdminCategory {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  isActive: boolean
}
export interface AdminColor { id: string; name: string; code: string; hex: string }
export interface AdminSize { id: string; name: string; code: string }
export interface AdminImage { id: string; imageUrl: string; alt: string; sortOrder: number }
export interface AdminVariant {
  id: string
  sku: string
  price: string | null
  stock: number
  color: AdminColor | null
  size: AdminSize | null
}
export interface AdminProduct {
  id: string
  categoryId: string
  name: string
  slug: string
  description: string
  price: string
  salePrice: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  isFeatured: boolean
  category: AdminCategory
  images: AdminImage[]
  variants: AdminVariant[]
}
