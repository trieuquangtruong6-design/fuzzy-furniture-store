import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '../services/apiClient'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const [fullName, setFullName] = useState('')
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

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || password.length < 8) {
      window.alert('Password must contain at least 8 characters, including uppercase, lowercase and a number.')
      return
    }

    try {
      setSubmitting(true)
      const user = await authService.register({ fullName, email, password })
      setUser(user)
      navigate('/profile', { replace: true })
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
            <h2>Let’s you in</h2>
            <h4 className="p-0">Hey, You have been missed!</h4>
          </div>
        </div>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="custom-container">
          <div className="form-group">
            <label htmlFor="inputusername" className="form-label">Email id</label>
            <div className="form-input mb-4">
              <input type="text" className="form-control" id="inputusername" placeholder="Enter Your Name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
              <i className="iconsax icons" data-icon="user-1" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="inputemail" className="form-label">Email id</label>
            <div className="form-input mb-4">
              <input type="email" className="form-control" id="inputemail" placeholder="Enter Your Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
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
          <div className="submit-btn">
            <button type="submit" className="btn auth-btn w-100" disabled={submitting}>{submitting ? 'Signing Up...' : 'Sign UP'}</button>
          </div>
          <div className="division">
            <span>OR</span>
          </div>
          <h4 className="signup pt-0">Already have an account ?<a href="/login"> Sign in</a></h4>
        </div>
      </form>
    </div>
    
  )
}
