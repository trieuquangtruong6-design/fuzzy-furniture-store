import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { useAuthStore } from '../store/authStore'
import './AdminCenterPage.scss'

const adminSections = [
  {
    eyebrow: 'Accounts',
    title: 'User Management',
    description: 'Review customer accounts, manage access and administrator roles.',
    href: '/admin/users',
    action: 'Manage users',
  },
  {
    eyebrow: 'Catalog',
    title: 'Product Management',
    description: 'Add, edit and hide products. Manage images, variants, SKUs and inventory.',
    href: '/admin/products',
    action: 'Manage products',
  },
  {
    eyebrow: 'Fulfilment',
    title: 'Order Management',
    description: 'Review orders, update statuses, and follow payment and fulfilment timelines.',
    href: '/admin/orders',
    action: 'Manage orders',
  },
  {
    eyebrow: 'Catalog structure',
    title: 'Category Management',
    description: 'Manage product categories from the catalog management workspace.',
    href: '/admin/products',
    action: 'Manage categories',
  },
  {
    eyebrow: 'Product attributes',
    title: 'Color & Size',
    description: 'Manage product colors and sizes from the catalog management workspace.',
    href: '/admin/products',
    action: 'Manage attributes',
  },
]

export default function AdminCenterPage() {
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const previous = document.body.className
    document.body.className = ''
    return () => {
      document.body.className = previous
    }
  }, [])

  return (
    <main className="admin-center">
      <div className="admin-center__shell">
        <nav className="admin-center__nav" aria-label="Admin navigation">
          <Link className="admin-center__brand" to="/admin">
            <span>F</span>
            <strong>Fuzzy Admin</strong>
          </Link>
          <div className="admin-center__nav-links">
            <Link className="active" to="/admin">Dashboard</Link>
            <Link to="/admin/products">Products</Link>
            <Link to="/admin/orders">Orders</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/home">Back to Store</Link>
          </div>
        </nav>

        <header className="admin-center__hero">
          <div>
            <span className="admin-center__kicker">Administration workspace</span>
            <h1>Admin Center</h1>
            <p>Manage products, orders and system catalog data from one place.</p>
          </div>
          <div className="admin-center__identity">
            <span>Signed in as</span>
            <strong>{user?.fullName}</strong>
            <small>{user?.email}</small>
          </div>
        </header>

        <section className="admin-center__intro">
          <div>
            <span>Workspace</span>
            <h2>Management tools</h2>
          </div>
          <p>Select an area below to continue.</p>
        </section>

        <section className="admin-center__grid" aria-label="Management tools">
          {adminSections.map((section, index) => (
            <Link className="admin-center__card" to={section.href} key={section.title}>
              <div className="admin-center__card-top">
                <span className="admin-center__number">{String(index + 1).padStart(2, '0')}</span>
                <span className="admin-center__arrow" aria-hidden="true">→</span>
              </div>
              <small>{section.eyebrow}</small>
              <h2>{section.title}</h2>
              <p>{section.description}</p>
              <strong>{section.action}</strong>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
