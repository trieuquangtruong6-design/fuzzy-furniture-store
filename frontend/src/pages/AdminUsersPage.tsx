import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getApiErrorMessage } from '../services/apiClient'
import { adminUserService } from '../services/adminUserService'
import { useAuthStore } from '../store/authStore'
import type { AdminUser } from '../types/adminUser'
import './AdminUsersPage.scss'

export default function AdminUsersPage() {
  const currentUser = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL')
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'LOCKED'>('ALL')
  const users = useQuery({ queryKey: ['admin-users'], queryFn: adminUserService.list })
  const update = useMutation({
    mutationFn: ({ id, input }: {
      id: string
      input: { role?: 'USER' | 'ADMIN'; isActive?: boolean }
    }) => adminUserService.update(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData<AdminUser[]>(['admin-users'], (list) =>
        list?.map((user) => user.id === updated.id ? updated : user) ?? [updated],
      )
    },
  })

  useEffect(() => {
    const previous = document.body.className
    document.body.className = ''
    return () => {
      document.body.className = previous
    }
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (users.data ?? []).filter((user) =>
      (!term || user.fullName.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)) &&
      (role === 'ALL' || user.role === role) &&
      (status === 'ALL' || (status === 'ACTIVE' ? user.isActive : !user.isActive)),
    )
  }, [role, search, status, users.data])

  const stats = useMemo(() => ({
    total: users.data?.length ?? 0,
    customers: users.data?.filter((user) => user.role === 'USER').length ?? 0,
    admins: users.data?.filter((user) => user.role === 'ADMIN').length ?? 0,
    locked: users.data?.filter((user) => !user.isActive).length ?? 0,
  }), [users.data])

  function changeRole(user: AdminUser, nextRole: 'USER' | 'ADMIN') {
    if (user.role === nextRole) return
    if (!window.confirm(`Change ${user.email} to ${nextRole}?`)) return
    update.mutate({ id: user.id, input: { role: nextRole } })
  }

  function toggleStatus(user: AdminUser) {
    const action = user.isActive ? 'lock' : 'unlock'
    if (!window.confirm(`${action[0].toUpperCase()}${action.slice(1)} ${user.email}?`)) return
    update.mutate({ id: user.id, input: { isActive: !user.isActive } })
  }

  return (
    <main className="admin-users">
      <header className="admin-users__header">
        <div>
          <small>Fuzzy administration</small>
          <h1>User Management</h1>
          <p>Manage customer access and administrator roles.</p>
        </div>
        <div className="admin-users__header-actions">
          <button className="btn gray-btn mt-0" onClick={() => users.refetch()}>Refresh</button>
          <a className="btn gray-btn mt-0" href="/admin">Admin Center</a>
        </div>
      </header>

      <section className="admin-users__stats">
        <article><span>Total</span><strong>{stats.total}</strong></article>
        <article><span>Customers</span><strong>{stats.customers}</strong></article>
        <article><span>Admins</span><strong>{stats.admins}</strong></article>
        <article><span>Locked</span><strong>{stats.locked}</strong></article>
      </section>

      <section className="admin-users__panel">
        <div className="admin-users__title">
          <div><small>Accounts</small><h2>Users <span>{filtered.length}</span></h2></div>
        </div>
        <div className="admin-users__filters">
          <input className="form-control" type="search" placeholder="Search name or email..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="form-control" value={role} onChange={(event) => setRole(event.target.value as typeof role)}><option value="ALL">All roles</option><option value="USER">Customers</option><option value="ADMIN">Admins</option></select>
          <select className="form-control" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="LOCKED">Locked</option></select>
        </div>

        {users.isLoading && <div className="admin-users__feedback">Loading users...</div>}
        {users.isError && <div className="admin-users__feedback">{getApiErrorMessage(users.error)}</div>}
        {update.isError && <div className="admin-users__error">{getApiErrorMessage(update.error)}</div>}
        {!users.isLoading && !filtered.length && <div className="admin-users__feedback">No matching users.</div>}

        <div className="admin-users__list">
          {filtered.map((user) => {
            const isSelf = user.id === currentUser?.id
            return (
              <article className="admin-user-card" key={user.id}>
                <div className="admin-user-card__top">
                  <img src={user.avatarUrl || '/fuzzy/assets/images/icons/profile1.png'} alt="" />
                  <div>
                    <h3>{user.fullName}{isSelf && <small>You</small>}</h3>
                    <p>{user.email}</p>
                    <span className={user.isActive ? 'active' : 'locked'}>{user.isActive ? 'Active' : 'Locked'}</span>
                  </div>
                </div>
                <div className="admin-user-card__metrics">
                  <span><strong>{user._count.orders}</strong>Orders</span>
                  <span><strong>{user._count.addresses}</strong>Addresses</span>
                  <span><strong>{user._count.wishlistItems}</strong>Wishlist</span>
                </div>
                <div className="admin-user-card__meta">
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  {user.phone && <span>{user.phone}</span>}
                </div>
                <div className="admin-user-card__actions">
                  <select
                    className="form-control"
                    aria-label={`Role for ${user.email}`}
                    value={user.role}
                    disabled={isSelf || update.isPending}
                    onChange={(event) => changeRole(user, event.target.value as 'USER' | 'ADMIN')}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <button
                    type="button"
                    className={`btn mt-0 ${user.isActive ? 'admin-user-card__lock' : 'theme-btn'}`}
                    disabled={isSelf || update.isPending}
                    onClick={() => toggleStatus(user)}
                  >
                    {user.isActive ? 'Lock account' : 'Unlock account'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
