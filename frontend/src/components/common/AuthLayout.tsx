import type { ReactNode } from 'react'

export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="auth-page">
      <div className="auth-img"><img className="img-fluid auth-bg" src="/fuzzy/assets/images/background/auth_bg.jpg" alt="" /><div className="auth-content"><div><h2>{title}</h2><h4 className="p-0">{subtitle}</h4></div></div></div>
      {children}
    </div>
  )
}
