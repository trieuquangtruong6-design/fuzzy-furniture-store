export type PaymentMethod = 'COD' | 'BANK_TRANSFER'
export type OrderStatus = 'PENDING' | 'PREPARING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'
export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface CreatedOrder {
  id: string
  orderCode: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  shippingFullName: string
  shippingPhone: string
  shippingAddress: string
  subtotal: string
  shippingFee: string
  discount: string
  total: string
  createdAt: string
  updatedAt: string
  items: Array<{
    id: string
    productName: string
    productImage: string
    variantName: string | null
    price: string
    quantity: number
    total: string
  }>
  payment: {
    id: string
    provider: string
    amount: string
    status: PaymentStatus
  } | null
  statusHistory: Array<{
    id: string
    status: OrderStatus
    note: string | null
    createdAt: string
  }>
}

export interface CreateOrderResult {
  order: CreatedOrder
  replayed: boolean
}
