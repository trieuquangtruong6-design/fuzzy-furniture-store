import { Link, useLocation } from 'react-router-dom'
import CartBadge from '../cart/CartBadge'

const items = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/categories', icon: 'categories', label: 'Categories' },
  { to: '/cart', icon: 'bag', label: 'Cart' },
  { to: '/categories', icon: 'heart', label: 'Wishlist', neverActive: true },
  { to: '/profile', icon: 'profile', label: 'Profile' },
]

export default function BottomNavigation() {
  const { pathname } = useLocation()

  return (
    <div className="navbar-menu">
      <ul>
        {items.map((item) => (
          <li key={`${item.icon}-${item.to}`} className={!item.neverActive && pathname === item.to ? 'active' : ''}>
            <Link to={item.to} aria-label={item.label}>
              <div className="icon">
                <img className="unactive" src={`/fuzzy/assets/images/svg/${item.icon}.svg`} alt="" />
                <img className="active" src={`/fuzzy/assets/images/svg/${item.icon}-fill.svg`} alt="" />
                {item.to === '/cart' && <CartBadge />}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
