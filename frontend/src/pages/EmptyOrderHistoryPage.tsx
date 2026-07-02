import { useEffect } from 'react'

export default function EmptyOrderHistoryPage() {
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
            <h3>Order History</h3>
          </div>
        </div>
      </header>
      <section className="section-b-space pt-0">
        <div className="custom-container">
          <div className="empty-tab">
            <img className="img-fluid empty-img w-100" src="/fuzzy/assets/images/gif/order.gif" alt="empty-order" />
            <h2>No Order Available</h2>
            <h5 className="mt-3">If you haven't made any order yet, do so now for a better life.</h5>
          </div>
        </div>
      </section>
    </div>
    
  )
}
