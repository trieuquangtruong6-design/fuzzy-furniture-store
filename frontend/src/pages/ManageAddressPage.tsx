import { useEffect } from 'react'

export default function ManageAddressPage() {
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
            <a href="/profile">
              <i className="iconsax back-btn" data-icon="arrow-left" />
            </a>
            <h3>Saved Address</h3>
          </div>
        </div>
      </header>
      <section className="shipping-details-sec">
        <div className="custom-container">
          <ul className="address-list">
            <li>
              <div className="shipping-address">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="radio1" defaultChecked />
                    <label className="form-check-label" htmlFor="radio1">Home</label>
                  </div>
                </div>
                <div className="address-details">
                  <p>3501 Maloy Court, East Emhurst, New York City, NY 11369</p>
                  <h5 className="content-number">Phone no. : <span> 78596 0000</span></h5>
                </div>
              </div>
            </li>
            <li>
              <div className="shipping-address">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="radio2" />
                    <label className="form-check-label" htmlFor="radio2">Office</label>
                  </div>
                </div>
                <div className="address-details">
                  <p>8502-8503 Preston Rd. Inglewood Street, Maine 98380</p>
                  <h5 className="content-number">Phone no. : <span> 12100 0023</span></h5>
                </div>
              </div>
            </li>
          </ul>
          <div className="apply-btn">
            <a href="/profile" className="btn theme-btn w-100">apply</a>
          </div>
        </div>
      </section>
      <section className="panel-space" />
    </div>
    
  )
}
