import { useEffect } from 'react'

export default function EmptyNotificationPage() {
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
            <h3>Notification</h3>
          </div>
        </div>
      </header>
      <section className="section-b-space pt-0">
        <div className="custom-container">
          <div className="empty-tab">
            <img className="img-fluid empty-img w-100" src="/fuzzy/assets/images/gif/notifiction.gif" alt="empty-bell" />
            <h2>No Notifications Found!!</h2>
            <h5 className="mt-3">You don’t have new notification right now. If we received anything we will notify you.</h5>
            <a href="/notification" className="btn theme-btn w-100 mt-5" role="button">Refresh</a>
          </div>
        </div>
      </section>
    </div>
    
  )
}
