import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../services/apiClient'
import { orderService } from '../services/orderService'
import './OrdersPage.scss'

export default function OrderDetailsPage() {
  const { orderCode = '' } = useParams()
  const queryClient = useQueryClient()
  const order = useQuery({ queryKey: ['order', orderCode], queryFn: () => orderService.detail(orderCode), enabled: Boolean(orderCode) })
  const cancel = useMutation({
    mutationFn: () => orderService.cancel(orderCode),
    onSuccess: (data) => {
      queryClient.setQueryData(['order', orderCode], data)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
  useEffect(() => {
    const previous = document.body.className
    document.body.className = ''
    return () => { document.body.className = previous }
  }, [])
  if (!orderCode) return <div className="orders-empty"><p>Choose an order from your order history.</p><a className="btn theme-btn" href="/orders">My orders</a></div>
  if (order.isLoading) return <div className="orders-empty">Loading order...</div>
  if (order.isError || !order.data) return <div className="orders-empty"><p>{getApiErrorMessage(order.error)}</p><a className="btn gray-btn" href="/orders">Back to orders</a></div>
  const data = order.data
  const canCancel = data.status === 'PENDING' || data.status === 'PREPARING'

  return <div className="orders-page">
    <header className="section-t-space"><div className="custom-container"><div className="header-panel"><a href="/orders"><i className="iconsax back-btn" data-icon="arrow-left" /></a><h3>Order Details</h3></div></div></header>
    <main className="custom-container order-detail">
      <section className="order-detail__hero"><div><small>Order code</small><h2>{data.orderCode}</h2><p>Placed {new Date(data.createdAt).toLocaleString()}</p></div><span className={`order-status order-status--${data.status.toLowerCase()}`}>{data.status}</span></section>
      <section className="order-detail__grid">
        <div className="order-panel"><h3>Items</h3>{data.items.map((item) => <div className="order-line" key={item.id}><img src={item.productImage || '/fuzzy/assets/images/product/1.png'} alt={item.productName} /><div><strong>{item.productName}</strong><small>{item.variantName} · Qty {item.quantity}</small></div><b>${item.total}</b></div>)}</div>
        <aside className="order-panel"><h3>Summary</h3><dl><div><dt>Subtotal</dt><dd>${data.subtotal}</dd></div><div><dt>Shipping</dt><dd>${data.shippingFee}</dd></div><div><dt>Discount</dt><dd>-${data.discount}</dd></div><div className="total"><dt>Total</dt><dd>${data.total}</dd></div></dl><p><strong>Payment:</strong> {data.paymentMethod === 'COD' ? 'Cash on delivery' : 'Bank transfer'} ({data.paymentStatus})</p></aside>
      </section>
      <section className="order-panel"><h3>Shipping</h3><p><strong>{data.shippingFullName}</strong> · {data.shippingPhone}</p><p>{data.shippingAddress}</p></section>
      <section className="order-panel"><h3>Timeline</h3><ol className="order-timeline">{data.statusHistory.map((entry) => <li key={entry.id}><span /><div><strong>{entry.status}</strong><small>{new Date(entry.createdAt).toLocaleString()}{entry.note ? ` · ${entry.note}` : ''}</small></div></li>)}</ol></section>
      {cancel.isError && <div className="order-error">{getApiErrorMessage(cancel.error)}</div>}
      {canCancel && <button className="btn order-cancel" disabled={cancel.isPending} onClick={() => { if (window.confirm('Cancel this order and return its items to stock?')) cancel.mutate() }}>{cancel.isPending ? 'Cancelling...' : 'Cancel order'}</button>}
    </main>
  </div>
}

