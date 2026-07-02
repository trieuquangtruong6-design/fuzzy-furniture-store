import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import CartBadge from '../components/cart/CartBadge'
import CurrentUserAvatar from '../components/auth/CurrentUserAvatar'

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const previousClass = document.body.className
    document.body.className = ""
    return () => {
      document.body.className = previousClass
    }
  }, [])

  return (
    <div>
      <header className="profile-header section-t-space">
        <div className="custom-container">
          <div className="header-panel">
            <h3>Profile</h3>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="profile-pic mt-5">
              <CurrentUserAvatar className="img-fluid img" />
            </div>
            <div className="profile-name d-flex align-items-center justify-content-between mt-3 w-100">
              <h4 className="theme-color">{user?.fullName}</h4>
              <a
                href="/profile-setting"
                aria-label="Edit profile"
                style={{ alignItems: 'center', display: 'flex', height: 44, justifyContent: 'center', width: 44 }}
              >
                <i className="iconsax edit-icon" data-icon="edit-1" />
              </a>
            </div>
          </div>
        </div>
      </header>
      <section className="section-b-space pt-0">
        <div className="custom-container">
          <ul className="profile-list">
            <li>
              <a href="/orders" className="profile-box">
                <div className="profile-img">
                  <i className="iconsax icon" data-icon="box" />
                </div>
                <div className="profile-details">
                  <h4>Orders</h4>
                  <h5>Ongoing orders, Recent orders..</h5>
                </div>
              </a>
            </li>
            {user?.role === 'ADMIN' && (
              <li>
                <a href="/admin" className="profile-box">
                  <div className="profile-img">
                    <i className="iconsax icon" data-icon="shop" />
                  </div>
                  <div className="profile-details">
                    <h4>Admin Center</h4>
                    <h5>Manage products, orders and catalog data</h5>
                  </div>
                </a>
              </li>
            )}
            <li>
              <a href="/wishlist" className="profile-box">
                <div className="profile-img">
                  <i className="iconsax icon" data-icon="heart" />
                </div>
                <div className="profile-details">
                  <h4>Wishlist</h4>
                  <h5>Your save product</h5>
                </div>
              </a>
            </li>
            <li>
              <a href="/manage-payment" className="profile-box">
                <div className="profile-img">
                  <i className="iconsax icon" data-icon="wallet-open" />
                </div>
                <div className="profile-details">
                  <h4>Payment</h4>
                  <h5>Saved card, Wallets</h5>
                </div>
              </a>
            </li>
            <li>
              <a href="/shipping-address" className="profile-box">
                <div className="profile-img">
                  <i className="iconsax icon" data-icon="location" />
                </div>
                <div className="profile-details">
                  <h4>Saved Address</h4>
                  <h5>Home, Office</h5>
                </div>
              </a>
            </li>
            <li>
              <a href="/language" className="profile-box">
                <div className="profile-img">
                  <i className="iconsax icon" data-icon="translate" />
                </div>
                <div className="profile-details">
                  <h4>Language</h4>
                  <h5>Select your language here</h5>
                </div>
              </a>
            </li>
            <li>
              <a href="/notification" className="profile-box">
                <div className="profile-img">
                  <i className="iconsax icon" data-icon="bell-1" />
                </div>
                <div className="profile-details">
                  <h4>Notification</h4>
                  <h5>Offers, Order tracking messages</h5>
                </div>
              </a>
            </li>
            <li>
              <a href="/setting" className="profile-box">
                <div className="profile-img">
                  <i className="iconsax icon" data-icon="setting-1" />
                </div>
                <div className="profile-details">
                  <h4>Settings</h4>
                  <h5>app settings, Dark mode</h5>
                </div>
              </a>
            </li>
            <li>
              <a href="/terms-conditions" className="profile-box">
                <div className="profile-img">
                  <i className="iconsax icon" data-icon="info-circle" />
                </div>
                <div className="profile-details">
                  <h4>Terms &amp; Conditions</h4>
                  <h5>T&amp;C for use of platform</h5>
                </div>
              </a>
            </li>
            <li className="border-bottom-0">
              <a href="/help" className="profile-box">
                <div className="profile-img">
                  <i className="iconsax icon" data-icon="phone" />
                </div>
                <div className="profile-details">
                  <h4>Help</h4>
                  <h5>Customer Support, FAQs</h5>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </section>
      <section className="panel-space" />
      <div className="navbar-menu">
        <ul>
          <li>
            <a href="/home">
              <div className="icon">
                <img className="unactive" src="/fuzzy/assets/images/svg/home.svg" alt="home" />
                <img className="active" src="/fuzzy/assets/images/svg/home-fill.svg" alt="home" />
              </div>
            </a>
          </li>
          <li>
            <a href="/categories">
              <div className="icon">
                <img className="unactive" src="/fuzzy/assets/images/svg/categories.svg" alt="categories" />
                <img className="active" src="/fuzzy/assets/images/svg/categories-fill.svg" alt="categories" />
              </div>
            </a>
          </li>
          <li>
            <a href="/cart">
              <div className="icon">
                <img className="unactive" src="/fuzzy/assets/images/svg/bag.svg" alt="bag" />
                <img className="active" src="/fuzzy/assets/images/svg/bag-fill.svg" alt="bag" />
                <CartBadge />
              </div>
            </a>
          </li>
          <li>
            <a href="/wishlist">
              <div className="icon">
                <img className="unactive" src="/fuzzy/assets/images/svg/heart.svg" alt="heart" />
                <img className="active" src="/fuzzy/assets/images/svg/heart-fill.svg" alt="heart" />
              </div>
            </a>
          </li>
          <li className="active">
            <a href="/profile">
              <div className="icon">
                <img className="unactive" src="/fuzzy/assets/images/svg/profile.svg" alt="profile" />
                <img className="active" src="/fuzzy/assets/images/svg/profile-fill.svg" alt="profile" />
              </div>
            </a>
          </li>
        </ul>
      </div>
    </div>
    
  )
}
