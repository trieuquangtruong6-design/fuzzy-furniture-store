import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSwipeable } from 'react-swipeable'
import { getApiErrorMessage } from '../services/apiClient'
import { cartService } from '../services/cartService'
import type { CartItem } from '../types/cart'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import './CartPage.scss'

function CartRow({
  item,
  busy,
  onQuantity,
  onRemove,
}: {
  item: CartItem
  busy: boolean
  onQuantity: (item: CartItem, quantity: number) => void
  onRemove: (item: CartItem) => void
}) {
  const swipe = useSwipeable({
    onSwipedLeft: () => onRemove(item),
    trackMouse: false,
    preventScrollOnSwipe: true,
  })
  return (
    <li className={`cart-product-box ${!item.isAvailable ? 'cart-item-unavailable' : ''}`} {...swipe}>
      <div className="horizontal-product-box">
        <div className="horizontal-product-img">
          <a href={`/product/${item.product.slug}`}>
            <img className="img-fluid img" src={item.product.image?.imageUrl || '/fuzzy/assets/images/product/1.png'} alt={item.product.image?.alt || item.product.name} />
          </a>
        </div>
        <div className="horizontal-product-details">
          <div className="d-flex align-items-center justify-content-between">
            <a href={`/product/${item.product.slug}`}><h4>{item.product.name}</h4></a>
            <button type="button" className="cart-trash" aria-label={`Remove ${item.product.name}`} disabled={busy} onClick={() => onRemove(item)}>
              <i className="iconsax" data-icon="trash" />
            </button>
          </div>
          <ul className="product-info">
            <li>SKU: {item.variant?.sku ?? 'Unavailable'}</li>
            {item.variant?.color && <li><span className="product-color" style={{ backgroundColor: item.variant.color.hex }} />{item.variant.color.name}</li>}
            {item.variant?.size && <li>Size: {item.variant.size.name}</li>}
          </ul>
          {!item.isAvailable && <p className="cart-stock-error">Item unavailable or quantity exceeds current stock.</p>}
          <div className="d-flex align-items-center justify-content-between mt-3">
            <h3 className="fw-semibold">${item.lineTotal} <small>${item.unitPrice} each</small></h3>
            <div className="plus-minus">
              <button type="button" className="sub plus-minus-button" disabled={busy || item.quantity <= 1} onClick={() => onQuantity(item, item.quantity - 1)}><i className="iconsax" data-icon="minus" /></button>
              <input type="number" readOnly value={item.quantity} aria-label={`Quantity for ${item.product.name}`} />
              <button type="button" className="add plus-minus-button" disabled={busy || !item.isAvailable || item.quantity >= item.availableStock} onClick={() => onQuantity(item, item.quantity + 1)}><i className="iconsax" data-icon="add" /></button>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

export default function CartPage() {
  const isOnline = useOnlineStatus()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const cart = useQuery({ queryKey: ['cart'], queryFn: cartService.get })
  const update = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => cartService.update(id, quantity),
    onSuccess: (data) => queryClient.setQueryData(['cart'], data),
    onError: (error) => setMessage(getApiErrorMessage(error)),
  })
  const remove = useMutation({
    mutationFn: cartService.remove,
    onSuccess: (data) => queryClient.setQueryData(['cart'], data),
    onError: (error) => setMessage(getApiErrorMessage(error)),
  })
  const clear = useMutation({
    mutationFn: cartService.clear,
    onSuccess: (data) => queryClient.setQueryData(['cart'], data),
    onError: (error) => setMessage(getApiErrorMessage(error)),
  })

  useEffect(() => {
    const previousClass = document.body.className
    document.body.className = ''
    return () => { document.body.className = previousClass }
  }, [])

  const data = cart.data
  const busy = update.isPending || remove.isPending || clear.isPending
  if (cart.isLoading) return <div className="cart-feedback">Loading your cart...</div>
  if (cart.isError) return <div className="cart-feedback"><p>{getApiErrorMessage(cart.error)}</p><button className="btn theme-btn" onClick={() => cart.refetch()}>Try again</button></div>

  return (
    <div>
      <header className="section-t-space">
        <div className="custom-container">
          <div className="header-panel"><a href="/home"><i className="iconsax back-btn" data-icon="arrow-left" /></a><h3>My Cart ({data?.itemCount ?? 0})</h3></div>
        </div>
      </header>
      {!data?.items.length ? (
        <div className="custom-container"><div className="empty-tab"><img className="img-fluid empty-img w-100" src="/fuzzy/assets/images/gif/cart.gif" alt="Empty cart" /><h2>Your cart is empty.</h2><h5 className="mt-3">Explore our products and add something you love.</h5><a href="/shop" className="btn theme-btn w-100 mt-3 mb-3">Start Shopping</a></div></div>
      ) : (
        <>
          <section><div className="custom-container">
            <div className="cart-list-toolbar"><span>Swipe an item left to remove it</span><button className="cart-clear" disabled={busy} onClick={() => { if (window.confirm('Clear your entire cart?')) clear.mutate() }}>Clear cart</button></div>
            {message && <div className="cart-message" role="alert">{message}<button onClick={() => setMessage('')}>×</button></div>}
            <ul className="horizontal-product-list">{data.items.map((item) => <CartRow key={item.id} item={item} busy={busy} onQuantity={(entry, quantity) => { setMessage(''); update.mutate({ id: entry.id, quantity }) }} onRemove={(entry) => { if (window.confirm(`Remove ${entry.product.name} from cart?`)) remove.mutate(entry.id) }} />)}</ul>
          </div></section>
          <div className="pay-popup"><div className="price-items"><h6>Total price</h6><h2>${data.subtotal}</h2></div>{!isOnline ? <button className="btn btn-lg theme-btn pay-btn mt-0" disabled>Offline</button> : data.hasUnavailableItems ? <button className="btn btn-lg theme-btn pay-btn mt-0" disabled>Check stock</button> : <a href="/checkout" className="btn btn-lg theme-btn pay-btn mt-0">Checkout</a>}</div>
          <section className="panel-space" />
        </>
      )}
    </div>
  )
}
