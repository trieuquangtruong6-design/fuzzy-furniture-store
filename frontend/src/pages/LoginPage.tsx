import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '../services/apiClient'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setUser = useAuthStore((state) => state.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const previousClass = document.body.className
    document.body.className = "auth-body"
    return () => {
      document.body.className = previousClass
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || !password) {
      window.alert('Please enter your email and password.')
      return
    }

    try {
      setSubmitting(true)
      const user = await authService.login({ email, password })
      setUser(user)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/profile', { replace: true })
    } catch (error) {
      window.alert(getApiErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="auth-img">
        <img className="img-fluid auth-bg" src="/fuzzy/assets/images/background/auth_bg.jpg" alt="auth_bg" />
        <div className="auth-content">
          <div>
            <h2>Hello Again!</h2>
            <h4 className="p-0">Welcome back, You have been missed!</h4>
          </div>
        </div>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="custom-container">
          <div className="form-group">
            <label htmlFor="inputusername" className="form-label">Email id</label>
            <div className="form-input mb-4">
              <input type="email" className="form-control" id="inputusername" placeholder="Enter Your Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <i className="iconsax icons" data-icon="mail" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="inputPassword" className="form-label">Password</label>
            <div className="form-input">
              <input type="password" className="form-control" id="inputPassword" placeholder="Enter Your Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <i className="iconsax icons" data-icon="key" />
            </div>
          </div>
          <div className="option mt-3">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" defaultValue="" id="flexCheckDefault" />
              <label className="form-check-label" htmlFor="flexCheckDefault">Remember me</label>
            </div>
            <a className="forgot" href="/forgot-password">Forgot password?</a>
          </div>
          <div className="submit-btn">
            <button type="submit" className="btn auth-btn w-100" disabled={submitting}>{submitting ? 'Signing In...' : 'Sign In'}</button>
          </div>
          <div className="division">
            <span>OR</span>
          </div>
          <ul className="social-media">
            <li>
              <a href="https://www.facebook.com/login/" target="_blank">
                <img className="img-fluid icons" src="/fuzzy/assets/images/svg/facebook.svg" alt="facebook" />
              </a>
            </li>
            <li>
              <a href="https://www.google.co.in/" target="_blank">
                <img className="img-fluid icons" src="/fuzzy/assets/images/svg/google.svg" alt="facebook" />
              </a>
            </li>
            <li>
              <a href="https://www.apple.com/in/" target="_blank">
                <img className="img-fluid icons" src="/fuzzy/assets/images/svg/apple.svg" alt="facebook" />
              </a>
            </li>
          </ul>
          <h4 className="signup">Don’t have an account ?<a href="/register"> Sign up</a></h4>
        </div>
      </form>
    </div>
    
  )
}
