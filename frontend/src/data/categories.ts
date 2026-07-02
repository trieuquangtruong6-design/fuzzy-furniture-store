import type { Category } from '../types/catalog'

const asset = '/fuzzy/assets/images/product'

export const categories: Category[] = [
  { id: 1, name: 'Chairs', image: `${asset}/3.png`, count: 120 },
  { id: 2, name: 'Tables', image: `${asset}/21.png`, count: 120 },
  { id: 3, name: 'Sofas', image: `${asset}/11.png`, count: 120 },
  { id: 4, name: 'Hanging chairs', image: `${asset}/22.png`, count: 120 },
  { id: 5, name: 'Cabinets', image: `${asset}/23.png`, count: 120 },
  { id: 6, name: 'Lamp', image: `${asset}/24.png`, count: 120 },
  { id: 7, name: 'Cupboard', image: `${asset}/25.png`, count: 120 },
]
