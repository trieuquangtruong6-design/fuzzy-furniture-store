import { Link } from 'react-router-dom'
import Icon from './Icon'

interface PageHeaderProps {
  title: string
  backTo?: string
  action?: React.ReactNode
}

export default function PageHeader({ title, backTo, action }: PageHeaderProps) {
  return (
    <header className="section-t-space">
      <div className="custom-container">
        <div className="header-panel">
          {backTo ? <Link to={backTo}><Icon name="arrow-left" className="back-btn" /></Link> : <span />}
          <h3>{title}</h3>
          {action ?? <span />}
        </div>
      </div>
    </header>
  )
}
