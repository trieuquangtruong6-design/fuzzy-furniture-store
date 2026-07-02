import type { Product } from '../types/catalog'

const asset = '/fuzzy/assets/images/product'

export const products: Product[] = [
  { id: 1, name: 'Buddy Chair', subtitle: 'Modern saddle arms', price: 102.25, oldPrice: 120, image: `${asset}/1.png`, rating: 4.5 },
  { id: 2, name: 'Mid Century Sofa', subtitle: 'Modern arms sofa', price: 999, image: `${asset}/4.png`, rating: 4.5 },
  { id: 3, name: 'Beige Chair', subtitle: 'Modern arms chair', price: 37, image: `${asset}/5.png`, rating: 4.5 },
  { id: 4, name: 'Table Lamp', subtitle: 'Bedroom study table lamp', price: 37, image: `${asset}/6.png`, rating: 4.5 },
  { id: 5, name: 'Wingback Chair', subtitle: 'Modern arms chair', price: 25, oldPrice: 35, image: `${asset}/3.png`, rating: 4.5 },
  { id: 6, name: 'Lounge Chair', subtitle: 'Comfortable blue chair', price: 130, oldPrice: 160, image: `${asset}/11.png`, rating: 4.3 },
]

export const cartProducts = [
  { ...products[5], color: 'Blue', colorClass: 'color1' },
  { id: 7, name: 'Hanging Light', subtitle: 'Modern hanging light', price: 30, oldPrice: 60, image: `${asset}/13.png`, color: 'Black', colorClass: 'color2' },
  { id: 8, name: 'Side Table', subtitle: 'Wooden side table', price: 50, oldPrice: 80, image: `${asset}/7.png`, color: 'Brown', colorClass: 'color3' },
]
