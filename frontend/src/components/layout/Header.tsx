import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import CurrentUserAvatar from '../auth/CurrentUserAvatar'
import { useAuthStore } from '../../store/authStore'

export default function Header() {
  const user = useAuthStore((state) => state.user)

  return (
    <header className="section-t-space">
      <div className="custom-container">
        <div className="header">
          <div className="head-content">
            <button className="sidebar-btn react-button-reset" type="button" aria-label="Open menu"><Icon name="menu" className="menu-icon" /></button>
            <div className="header-info">
              <CurrentUserAvatar className="img-fluid profile-pic" alt="Profile" />
              <div><h4 className="light-text">Hello</h4><h2 className="theme-color">{user?.fullName ?? 'Guest'}!</h2></div>
            </div>
          </div>
          <Link to="/profile" className="notification" aria-label="Profile"><Icon name="bell" className="notification-icon" /></Link>
        </div>
      </div>
    </header>
  )
}
