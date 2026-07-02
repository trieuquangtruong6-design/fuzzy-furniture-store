import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '../services/apiClient'
import { adminOrderService } from '../services/adminOrderService'
import type { OrderStatus } from '../types/order'
import './AdminOrdersPage.scss'

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PREPARING', 'CANCELLED'],
  PREPARING: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | OrderStatus>('ALL')
  const [selectedId, setSelectedId] = useState('')
  const orders = useQuery({ queryKey: ['admin-orders'], queryFn: adminOrderService.list })
  const detail = useQuery({ queryKey: ['admin-order', selectedId], queryFn: () => adminOrderService.detail(selectedId), enabled: Boolean(selectedId) })
  const update = useMutation({
    mutationFn: ({ target, note }: { target: OrderStatus; note: string }) => adminOrderService.updateStatus(selectedId, target, note),
    onSuccess: (order) => {
      queryClient.setQueryData(['admin-order', selectedId], order)
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
  })
  const filtered = useMemo(() => (orders.data ?? []).filter((order) => {
    const term = search.trim().toLowerCase()
    return (!term || order.orderCode.toLowerCase().includes(term) || order.user.email.toLowerCase().includes(term) || order.user.fullName.toLowerCase().includes(term))
      && (status === 'ALL' || order.status === status)
  }), [orders.data, search, status])

  useEffect(() => {
    const previous = document.body.className
    document.body.className = ''
    return () => { document.body.className = previous }
  }, [])

  function changeStatus(target: OrderStatus) {
    const important = target === 'CANCELLED' || target === 'COMPLETED'
    if (important && !window.confirm(`Change this order to ${target}?`)) return
    const note = window.prompt('Timeline note (optional)', '') ?? ''
    update.mutate({ target, note })
  }

  return <div className="admin-orders custom-container">
    <header className="admin-orders__hero"><div><small>Fuzzy administration</small><h1>Order Management</h1><p>Review orders, payments and fulfilment status.</p></div><a className="btn gray-btn mt-0" href="/admin/products">Product catalog</a></header>
    <section className="admin-orders__panel">
      <div className="admin-orders__filters"><input className="form-control" placeholder="Search order, customer or email..." value={search} onChange={(event) => setSearch(event.target.value)} /><select className="form-control" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="ALL">All statuses</option><option value="PENDING">Pending</option><option value="PREPARING">Preparing</option><option value="SHIPPING">Shipping</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></div>
      {orders.isLoading && <div className="admin-orders__empty">Loading orders...</div>}
      {orders.isError && <div className="admin-orders__empty">{getApiErrorMessage(orders.error)}</div>}
      <div className="admin-orders__table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Payment</th><th>Total</th><th>Status</th><th /></tr></thead><tbody>{filtered.map((order) => <tr key={order.id}><td><strong>{order.orderCode}</strong><small>{new Date(order.createdAt).toLocaleDateString()}</small></td><td>{order.user.fullName}<small>{order.user.email}</small></td><td>{order.paymentMethod}<small>{order.paymentStatus}</small></td><td><strong>${order.total}</strong></td><td><span className={`admin-order-status status-${order.status.toLowerCase()}`}>{order.status}</span></td><td><button className="btn gray-btn mt-0" onClick={() => setSelectedId(order.id)}>View</button></td></tr>)}</tbody></table></div>
      {!orders.isLoading && !filtered.length && <div className="admin-orders__empty">No matching orders.</div>}
    </section>

    {selectedId && <div className="admin-order-modal" role="dialog" aria-modal="true"><div className="admin-order-modal__content">
      <button className="admin-order-modal__close" aria-label="Close" onClick={() => setSelectedId('')}>×</button>
      {detail.isLoading && <p>Loading order...</p>}
      {detail.isError && <p>{getApiErrorMessage(detail.error)}</p>}
      {detail.data && <>
        <div className="admin-order-modal__heading"><div><small>{detail.data.orderCode}</small><h2>{detail.data.user.fullName}</h2><p>{detail.data.user.email} · {detail.data.shippingPhone}</p></div><span className={`admin-order-status status-${detail.data.status.toLowerCase()}`}>{detail.data.status}</span></div>
        <div className="admin-order-modal__grid"><section><h3>Items</h3>{detail.data.items.map((item) => <div className="admin-order-item" key={item.id}><img src={item.productImage || '/fuzzy/assets/images/product/1.png'} alt={item.productName} /><span><strong>{item.productName}</strong><small>{item.variantName} · Qty {item.quantity}</small></span><b>${item.total}</b></div>)}</section><section><h3>Delivery & payment</h3><p>{detail.data.shippingAddress}</p><p><strong>{detail.data.paymentMethod}</strong> · {detail.data.paymentStatus}</p><h2>${detail.data.total}</h2></section></div>
        <section className="admin-order-timeline"><h3>Timeline</h3>{detail.data.statusHistory.map((entry) => <p key={entry.id}><strong>{entry.status}</strong><span>{new Date(entry.createdAt).toLocaleString()} · {entry.note}</span></p>)}</section>
        {update.isError && <div className="admin-order-error">{getApiErrorMessage(update.error)}</div>}
        <div className="admin-order-actions">{transitions[detail.data.status].map((target) => <button key={target} className={`btn mt-0 ${target === 'CANCELLED' ? 'gray-btn' : 'theme-btn'}`} disabled={update.isPending} onClick={() => changeStatus(target)}>{target === 'CANCELLED' ? 'Cancel order' : `Mark ${target.toLowerCase()}`}</button>)}</div>
      </>}
    </div></div>}
  </div>
}

