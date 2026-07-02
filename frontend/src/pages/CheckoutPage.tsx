import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '../services/apiClient'
import { checkoutService } from '../services/checkoutService'
import { orderService } from '../services/orderService'
import type { CreatedOrder, PaymentMethod } from '../types/order'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import './CheckoutPage.scss'

export default function CheckoutPage() {
  const isOnline = useOnlineStatus()
  const queryClient = useQueryClient()
  const checkout = useQuery({ queryKey: ['checkout'], queryFn: checkoutService.get })
  const [step, setStep] = useState(1)
  const [addressId, setAddressId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD')
  const [note, setNote] = useState('')
  const [order, setOrder] = useState<CreatedOrder | null>(null)
  const idempotencyKey = useRef(crypto.randomUUID())
  const createOrder = useMutation({
    mutationFn: () => orderService.create({
      addressId,
      paymentMethod,
      note: note.trim() || null,
      idempotencyKey: idempotencyKey.current,
    }),
    onSuccess: async (result) => {
      setOrder(result.order)
      await queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.removeQueries({ queryKey: ['checkout'] })
    },
  })

  useEffect(() => {
    const previousClass = document.body.className
    document.body.className = ''
    return () => { document.body.className = previousClass }
  }, [])
  useEffect(() => {
    if (checkout.data?.defaultAddress && !addressId) setAddressId(checkout.data.defaultAddress.id)
  }, [addressId, checkout.data])

  if (order) {
    return <div className="checkout-page"><div className="checkout-success">
      <div className="checkout-success__icon">✓</div>
      <small>Order confirmed</small>
      <h1>Thank you for your order</h1>
      <p>Your order <strong>{order.orderCode}</strong> has been created successfully.</p>
      <div className="checkout-success__details">
        <span>Total<strong>${order.total}</strong></span>
        <span>Payment<strong>{order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Bank transfer'}</strong></span>
        <span>Status<strong>{order.paymentStatus}</strong></span>
      </div>
      {order.paymentMethod === 'BANK_TRANSFER' && <div className="checkout-notice">Use <strong>{order.orderCode}</strong> as your transfer reference. Payment remains UNPAID until an administrator verifies the transfer.</div>}
      <div className="d-flex gap-2"><a href="/home" className="btn gray-btn">Continue shopping</a><a href="/orders" className="btn theme-btn">My orders</a></div>
    </div></div>
  }
  if (checkout.isLoading) return <div className="checkout-feedback">Preparing checkout...</div>
  if (checkout.isError) return <div className="checkout-feedback"><p>{getApiErrorMessage(checkout.error)}</p><div className="d-flex gap-2"><a className="btn gray-btn" href="/cart">Back to cart</a><button className="btn theme-btn" onClick={() => checkout.refetch()}>Try again</button></div></div>
  if (!checkout.data) return null

  const data = checkout.data
  const selectedAddress = data.addresses.find((address) => address.id === addressId) ?? null
  const canContinue = step !== 1 || Boolean(selectedAddress)

  return (
    <div className="checkout-page">
      <header className="section-t-space"><div className="custom-container"><div className="header-panel"><a href="/cart"><i className="iconsax back-btn" data-icon="arrow-left" /></a><h3>Checkout</h3></div></div></header>
      <main className="custom-container checkout-layout">
        <div>
          <ol className="checkout-steps">
            {['Address', 'Payment', 'Confirm'].map((label, index) => <li key={label} className={step >= index + 1 ? 'active' : ''}><span>{index + 1}</span>{label}</li>)}
          </ol>

          {step === 1 && <section className="checkout-card">
            <div className="checkout-title"><div><small>Step 1</small><h2>Shipping address</h2></div><a href="/new-address?returnTo=/checkout">+ Add address</a></div>
            {!data.addresses.length && <div className="checkout-empty"><p>You need a shipping address before continuing.</p><a className="btn theme-btn" href="/new-address?returnTo=/checkout">Add shipping address</a></div>}
            <div className="checkout-addresses">{data.addresses.map((address) => <label key={address.id} className={`checkout-address ${addressId === address.id ? 'selected' : ''}`}><input type="radio" name="checkout-address" checked={addressId === address.id} onChange={() => setAddressId(address.id)} /><span><strong>{address.fullName}{address.isDefault && <em>Default</em>}</strong><small>{address.detail}, {address.ward}, {address.district}, {address.province}</small><small>{address.phone}</small></span></label>)}</div>
          </section>}

          {step === 2 && <section className="checkout-card">
            <div className="checkout-title"><div><small>Step 2</small><h2>Payment method</h2></div></div>
            <div className="checkout-addresses">
              <label className={`checkout-address ${paymentMethod === 'COD' ? 'selected' : ''}`}><input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} /><span><strong>Cash on delivery</strong><small>Pay when your order arrives.</small></span></label>
              <label className={`checkout-address ${paymentMethod === 'BANK_TRANSFER' ? 'selected' : ''}`}><input type="radio" name="payment" checked={paymentMethod === 'BANK_TRANSFER'} onChange={() => setPaymentMethod('BANK_TRANSFER')} /><span><strong>Bank transfer</strong><small>Transfer instructions will be provided after ordering.</small></span></label>
            </div>
          </section>}

          {step === 3 && <section className="checkout-card">
            <div className="checkout-title"><div><small>Step 3</small><h2>Review your order</h2></div></div>
            {selectedAddress && <div className="checkout-review-block"><h4>Deliver to</h4><p><strong>{selectedAddress.fullName}</strong> · {selectedAddress.phone}</p><p>{selectedAddress.detail}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}</p></div>}
            <div className="checkout-review-block"><h4>Payment</h4><p>{paymentMethod === 'COD' ? 'Cash on delivery' : 'Bank transfer'}</p></div>
            {paymentMethod === 'BANK_TRANSFER' && <div className="checkout-notice">Your payment will remain UNPAID until the bank transfer is verified. The order code will be used as the transfer reference.</div>}
            <div className="form-group mt-3"><label className="form-label" htmlFor="order-note">Order note (optional)</label><textarea id="order-note" className="form-control" maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Delivery instructions..." /></div>
            {!isOnline && <div className="checkout-order-error" role="alert">You are offline. Reconnect before placing the order.</div>}
            {createOrder.isError && <div className="checkout-order-error" role="alert">{getApiErrorMessage(createOrder.error)}</div>}
          </section>}

          <div className="checkout-actions">
            {step > 1 && <button className="btn gray-btn" disabled={createOrder.isPending} onClick={() => setStep((current) => current - 1)}>Back</button>}
            {step < 3 ? <button className="btn theme-btn" disabled={!canContinue} onClick={() => setStep((current) => current + 1)}>Continue</button> : <button className="btn theme-btn" disabled={!selectedAddress || !isOnline || createOrder.isPending} onClick={() => createOrder.mutate()}>{!isOnline ? 'Offline' : createOrder.isPending ? 'Placing order...' : 'Place order'}</button>}
          </div>
        </div>

        <aside className="checkout-card checkout-summary">
          <h2>Order summary</h2>
          <div className="checkout-items">{data.items.map((item) => <div className="checkout-item" key={item.cartItemId}><img src={item.productImage || '/fuzzy/assets/images/product/1.png'} alt={item.productName} /><div><strong>{item.productName}</strong><small>{item.variantName || item.sku} · Qty {item.quantity}</small></div><b>${item.lineTotal}</b></div>)}</div>
          <dl><div><dt>Subtotal</dt><dd>${data.summary.subtotal}</dd></div><div><dt>Shipping</dt><dd>{Number(data.summary.shippingFee) ? `$${data.summary.shippingFee}` : 'Free'}</dd></div><div><dt>Discount</dt><dd>-${data.summary.discount}</dd></div><div className="total"><dt>Total</dt><dd>${data.summary.total}</dd></div></dl>
          <p className="shipping-note">Free shipping on orders from ${data.shippingPolicy.freeShippingThreshold}.</p>
        </aside>
      </main>
    </div>
  )
}
