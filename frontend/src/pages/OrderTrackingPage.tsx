import { useEffect } from 'react'

export default function OrderTrackingPage() {
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
            <a href="/categories">
              <i className="iconsax back-btn" data-icon="arrow-left" />
            </a>
            <h3>Order Tracker</h3>
          </div>
        </div>
      </header>
      <section>
        <div className="custom-container">
          <h4 className="light-text fw-normal">01 Dec, 2022</h4>
          <div className="order-id d-flex justify-content-between gap-2 mt-2">
            <h4 className="theme-color fw-medium">Order ID : #1245035000</h4>
            <h4 className="theme-color fw-semibold"><span className="light-text fw-normal">Amount :</span> $112</h4>
          </div>
          <div className="order-tracking">
            <h2 className="mb-3">Order Journey</h2>
            <ul>
              <li className="order-process completed">
                <div className="d-flex gap-3 w-100">
                  <span>
                    <img className="process-icon" src="/fuzzy/assets/images/svg/chack.svg" alt="check" />
                  </span>
                  <div className="process-details">
                    <h4>Order Information Received</h4>
                    <h5>5:30 pm | 25 Nov, 2022</h5>
                  </div>
                </div>
              </li>
              <li className="order-process completed">
                <div className="d-flex gap-3 w-100">
                  <span>
                    <img className="process-icon" src="/fuzzy/assets/images/svg/chack.svg" alt="check" />
                  </span>
                  <div className="process-details">
                    <h4>The Parcel is being collected</h4>
                    <h5>8:00 am | 28 Nov, 2022</h5>
                  </div>
                </div>
              </li>
              <li className="order-process ongoing">
                <div className="d-flex gap-3 w-100">
                  <div className="ongoing-border">
                    <span>
                      <i className="iconsax process-icon" data-icon="box-time" />
                    </span>
                  </div>
                  <div className="process-details">
                    <h4>Ready To be Send</h4>
                    <h5>9:45 am | 29 Nov, 2022</h5>
                  </div>
                </div>
              </li>
              <li className="order-process">
                <div className="d-flex gap-3 w-100">
                  <span>
                    <i className="iconsax pending-icon" data-icon="truck-fast" />
                  </span>
                  <div className="process-details">
                    <h4>Dispatch in Local Wear House</h4>
                    <h5>2:20 pm | 30 Nov, 2022</h5>
                  </div>
                </div>
              </li>
              <li className="order-process">
                <div className="d-flex gap-3 w-100">
                  <span>
                    <i className="iconsax pending-icon" data-icon="gift" />
                  </span>
                  <div className="process-details">
                    <h4>Parcel Delivered</h4>
                    <h5>5:30 pm | 01 Dec, 2022</h5>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section className="bill-details section-b-space">
        <div className="custom-container">
          <div className="total-detail">
            <div className="sub-total d-flex justify-content-between">
              <h5 className="light-text">Sub Total</h5>
              <h4 className="fw-medium">$112</h4>
            </div>
            <div className="sub-total mt-3 d-flex justify-content-between">
              <h5 className="light-text">Shipping charge</h5>
              <h4 className="fw-medium">$20.00</h4>
            </div>
            <div className="sub-total mt-3 mb-3 d-flex justify-content-between">
              <h5 className="fw-medium light-text">Discount (10%)</h5>
              <h4 className="fw-medium">$0.00</h4>
            </div>
            <div className="grand-total pt-3 d-flex justify-content-between">
              <h5 className="fw-medium">Grand Total</h5>
              <h4 className="fw-semibold amount">$132</h4>
            </div>
          </div>
          <a href="/home" className="btn theme-btn w-100">Continue Shopping</a>
        </div>
      </section>
    </div>
    
  )
}
