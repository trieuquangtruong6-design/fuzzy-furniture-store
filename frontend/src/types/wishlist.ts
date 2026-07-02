export interface Wishlist {
  items: Array<{
    id: string
    createdAt: string
    product: {
      id: string
      name: string
      slug: string
      price: string
      salePrice: string | null
      status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
      isAvailable: boolean
      totalStock: number
      image: { imageUrl: string; alt: string } | null
      category: { id: string; name: string; slug: string; isActive: boolean }
      variants: Array<{ id: string; sku: string; stock: number }>
    }
  }>
  itemCount: number
}
