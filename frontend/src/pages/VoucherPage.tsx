import { useEffect } from 'react'

export default function VoucherPage() {
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
          <span className="devinfo-line">ID: <code>hkg1::hqdw9-1782700036048-7d8a27975222</code></span></p><a href="https://vercel.com/docs/errors/NOT_FOUND" className="owner-error"><div className="note">Read our documentation to learn more about this error.</div></a></main></div>
    
  )
}
