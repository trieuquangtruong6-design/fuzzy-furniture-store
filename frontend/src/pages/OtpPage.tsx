import { useEffect } from 'react'

export default function OtpPage() {
  useEffect(() => {
    const previousClass = document.body.className
    document.body.className = "auth-body"
    return () => {
      document.body.className = previousClass
    }
  }, [])

  return (
    <div>
      <div className="auth-img">
        <img className="img-fluid auth-bg" src="/fuzzy/assets/images/background/auth_bg.jpg" alt="auth_bg" />
        <div className="auth-content">
          <div>
            <h2>OTP Verification</h2>
          </div>
        </div>
      </div>
      <div className="custom-container">
        <div className="otp-verification">
          <h4>We have sent a verification code to</h4>
          <h4 className="otp-number mt-2">+91 635 546 23098</h4>
        </div>
        <form className="otp-form">
          <div className="form-input dark-border-gradient">
            <input type="number" className="form-control active" placeholder="0" id="five1" />
          </div>
          <div className="form-input dark-border-gradient">
            <input type="number" className="form-control" placeholder="0" id="five2" />
          </div>
          <div className="form-input dark-border-gradient">
            <input type="number" className="form-control" placeholder="0" id="five3" />
          </div>
          <div className="form-input dark-border-gradient">
            <input type="number" className="form-control" placeholder="0" id="five4" />
          </div>
          <div className="form-input dark-border-gradient">
            <input type="number" className="form-control" placeholder="0" id="five5" />
          </div>
        </form>
        <a href="/reset-password" className="btn auth-btn w-100" role="button">Verify</a>
      </div>
    </div>
    
  )
}
