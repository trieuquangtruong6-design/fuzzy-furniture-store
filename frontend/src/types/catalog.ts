export interface Product {
  id: number
  name: string
  subtitle: string
  price: number
  oldPrice?: number
  image: string
  rating?: number
}

export interface Category {
  id: number
  name: string
  image: string
  count: number
}
