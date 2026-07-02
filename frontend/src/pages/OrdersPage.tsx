import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getApiErrorMessage } from '../services/apiClient'
import { orderService } from '../services/orderService'
import type { OrderStatus } from '../types/order'
import './OrdersPage.scss'

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | OrderStatus>('ALL')
  const orders = useQuery({ queryKey: ['orders'], queryFn: orderService.list })
  const filtered = useMemo(() => (orders.data ?? []).filter((order) =>
    (!search.trim() || order.orderCode.toLowerCase().includes(search.trim().toLowerCase()))
    && (status === 'ALL' || order.status === status),
  ), [orders.data, search, status])

  useEffect(() => {
    const previous = document.body.className
    document.body.className = ''
    return () => { document.body.className = previous }
  }, [])

  return <div className="orders-page">
    <header className="section-t-space"><div className="custom-container"><div className="header-panel"><a href="/profile"><i className="iconsax back-btn" data-icon="arrow-left" /></a><h3>My Orders</h3></div></div></header>
    <main className="custom-container orders-container">
      <div className="orders-filter"><input className="form-control" placeholder="Search order code..." value={search} onChange={(event) => setSearch(event.target.value)} /><select className="form-control" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="ALL">All statuses</option><option value="PENDING">Pending</option><option value="PREPARING">Preparing</option><option value="SHIPPING">Shipping</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></div>
      {orders.isLoading && <div className="orders-empty">Loading orders...</div>}
      {orders.isError && <div className="orders-empty"><p>{getApiErrorMessage(orders.error)}</p><button className="btn theme-btn" onClick={() => orders.refetch()}>Try again</button></div>}
      {!orders.isLoading && !filtered.length && <div className="orders-empty"><h2>No orders found</h2><p>Your orders will appear here after checkout.</p><a href="/shop" className="btn theme-btn">Start shopping</a></div>}
      <div className="orders-list">{filtered.map((order) => <a className="order-card" href={`/orders/${order.orderCode}`} key={order.id}>
        <div className="order-card__top"><div><small>{new Date(order.createdAt).toLocaleDateString()}</small><h3>{order.orderCode}</h3></div><span className={`order-status order-status--${order.status.toLowerCase()}`}>{order.status}</span></div>
        <div className="order-card__items"><div className="order-thumbnails">{order.items.slice(0, 3).map((item) => <img key={item.id} src={item.productImage || '/fuzzy/assets/images/product/1.png'} alt={item.productName} />)}</div><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</span></div>
        <div className="order-card__bottom"><span>{order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Bank transfer'} · {order.paymentStatus}</span><strong>${order.total}</strong></div>
      </a>)}</div>
    </main>
  </div>
}

