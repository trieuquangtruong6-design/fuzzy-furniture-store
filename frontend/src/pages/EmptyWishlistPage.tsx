import { useEffect } from 'react'

export default function EmptyWishlistPage() {
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
            <h3>Wishlist</h3>
          </div>
        </div>
      </header>
      <section className="section-b-space pt-0">
        <div className="custom-container">
          <div className="empty-tab">
            <img className="img-fluid empty-img img1 w-100" src="/fuzzy/assets/images/gif/wishlist.gif" alt="empty-wishlist" />
            <h2>Your Wishlist is Empty!!</h2>
            <h5 className="mt-3">If you haven't made any wishes yet, do so now for a better life.</h5>
            <a href="/home" className="btn theme-btn w-100 mt-5" role="button">Add Now</a>
          </div>
        </div>
      </section>
    </div>
    
  )
}
