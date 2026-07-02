import { useEffect } from 'react'

export default function OtherSettingPage() {
  useEffect(() => {
    const previousClass = document.body.className
    document.body.className = ""
    return () => {
      document.body.className = previousClass
    }
  }, [])

  return (
    <div className="container"><main><p className="devinfo-container"><span className="error-code"><strong>404</strong>: NOT_FOUND</span>
          <span className="devinfo-line">Code: <code>NOT_FOUND</code></span>
          <span className="devinfo-line">ID: <code>hkg1::q2kcc-1782700034442-25a5e83b6214</code></span></p><a href="https://vercel.com/docs/errors/NOT_FOUND" className="owner-error"><div className="note">Read our documentation to learn more about this error.</div></a></main></div>
    
  )
}
