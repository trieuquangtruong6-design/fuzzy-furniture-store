import { useEffect } from 'react'

export default function PageListingPage() {
  useEffect(() => {
    const previousClass = document.body.className
    document.body.className = ""
    return () => {
      document.body.className = previousClass
    }
  }, [])

  return (
    <div>
      <header className="section-t-space">
        <div className="custom-container">
          <div className="header-panel">
            <a href="/home">
              <i className="iconsax back-btn" data-icon="arrow-left" />
            </a>
            <h2>Page-Listing</h2>
          </div>
        </div>
      </header>
      <section className="pt-0 section-b-space">
        <div className="custom-container">
          <div className="categories-title pb-2">
            <h2>Onboarding &amp; Authentication</h2>
          </div>
          <div className="categories-menu">
            <ul className="navigation">
              <li className="pages">
                <a href="/register">create Account<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/ne">Forgot Password<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/login">Login<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/">Onboarding<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/otp">Otp<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/reset-password">Reset Password<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
            </ul>
          </div>
          <div className="categories-title pb-2">
            <h2>Main Pages</h2>
          </div>
          <div className="categories-menu">
            <ul className="navigation">
              <li className="pages">
                <a href="/categories">Categories<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/home">Home Page<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/product/1">Product Details Page<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/product/2">Product-2 Details Page<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/shop">Shop page<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
            </ul>
          </div>
          <div className="categories-title pb-2">
            <h2>Cart, Order &amp; Payment Pages</h2>
          </div>
          <div className="categories-menu">
            <ul className="navigation">
              <li className="pages">
                <a href="/cart">cart<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/checkout">checkout<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/coupon">Coupon<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/new-address">New Address<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/new-card">New card<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/order-details">Order details<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/order-tracking">Order-tracking<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/payment">Payment<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/shipping-address">Shipping Address<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/shipping">Shipping Page<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
            </ul>
          </div>
          <div className="categories-title pb-2">
            <h2>Profile, Settings Pages</h2>
          </div>
          <div className="categories-menu">
            <ul className="navigation">
              <li className="pages">
                <a href="/help">Help<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/language">Language<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/manage-delivery-address">Manage-delivery-address<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/manage-payment">Manage payment<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/notification">Notification<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/orders">Order history<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/other-setting">Other setting<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/profile">Profile<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/profile-setting">Profile setting<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/setting">Setting<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/terms-conditions">Terms &amp; Conditions Page<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/voucher">Voucher<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/wishlist">Wishlist<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
            </ul>
          </div>
          <div className="categories-title pb-2">
            <h2>Other Pages</h2>
          </div>
          <div className="categories-menu">
            <ul className="navigation">
              <li className="pages">
                <a href="/empty-cart">Empty cart<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/empty-notification">Empty Notification<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/empty-order-history">Empty Order History<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/empty-search">Empty Search<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/empty-wishlist">Empty Wishlist<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/page-listing">Page-Listing<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
              <li className="pages">
                <a href="/search">Search<i className="iconsax" data-icon="chevron-right" /></a>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section className="panel-space" />
    </div>
    
  )
}
