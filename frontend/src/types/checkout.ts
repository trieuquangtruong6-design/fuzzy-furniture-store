export interface CheckoutAddress {
  id: string
  fullName: string
  phone: string
  province: string
  district: string
  ward: string
  detail: string
  isDefault: boolean
}

export interface CheckoutItem {
  cartItemId: string
  productId: string
  variantId: string
  productName: string
  productImage: string | null
  variantName: string | null
  sku: string | null
  unitPrice: string
  quantity: number
  lineTotal: string
  availableStock: number
}

export interface Checkout {
  items: CheckoutItem[]
  addresses: CheckoutAddress[]
  defaultAddress: CheckoutAddress | null
  summary: {
    subtotal: string
    shippingFee: string
    discount: string
    total: string
    currency: string
  }
  shippingPolicy: {
    freeShippingThreshold: string
    standardShippingFee: string
  }
}

