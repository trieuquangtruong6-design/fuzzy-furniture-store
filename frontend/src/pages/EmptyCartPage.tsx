import { useEffect } from 'react'

export default function EmptyCartPage() {
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
            <h3>My Cart</h3>
          </div>
        </div>
      </header>
      <div className="custom-container">
        <div className="empty-tab">
          <img className="img-fluid empty-img w-100" src="/fuzzy/assets/images/gif/cart.gif" alt="empty-cart" />
          <h2>Your luggage is empty.</h2>
          <h5 className="mt-3">Check out our top products to get the right one for you.</h5>
          <a href="/home" className="btn theme-btn w-100 mt-3 mb-3" role="button">Start Shopping</a>
        </div>
      </div>
    </div>
    
  )
}
