export interface Category { id: string; name: string; slug: string; imageUrl: string | null; _count: { products: number } }
export interface ProductCard {
  id: string; name: string; slug: string; price: string; salePrice: string | null
  isFeatured: boolean; totalStock: number; category: Category
  images: Array<{ imageUrl: string; alt: string }>
}
export interface ProductDetail extends ProductCard {
  description: string
  variants: Array<{
    id: string; sku: string; price: string | null; stock: number
    color: { id: string; name: string; code: string; hex: string } | null
    size: { id: string; name: string; code: string } | null
  }>
}
