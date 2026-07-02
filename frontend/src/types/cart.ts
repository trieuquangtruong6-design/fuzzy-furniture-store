export interface CartItem {
  id: string
  productId: string
  variantId: string
  quantity: number
  unitPrice: string
  lineTotal: string
  availableStock: number
  isAvailable: boolean
  product: {
    id: string
    name: string
    slug: string
    status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
    image: { imageUrl: string; alt: string; sortOrder: number } | null
    category: { id: string; name: string; slug: string; isActive: boolean }
  }
  variant: {
    id: string
    sku: string
    price: string | null
    stock: number
    color: { id: string; name: string; code: string; hex: string } | null
    size: { id: string; name: string; code: string } | null
  } | null
}

export interface Cart {
  id: string
  items: CartItem[]
  itemCount: number
  subtotal: string
  hasUnavailableItems: boolean
  updatedAt: string
}

