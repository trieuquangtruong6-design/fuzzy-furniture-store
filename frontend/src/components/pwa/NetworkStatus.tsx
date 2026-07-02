import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import './NetworkStatus.scss'

export default function NetworkStatus() {
  const isOnline = useOnlineStatus()
  if (isOnline) return null

  return <div className="offline-banner" role="status" aria-live="polite">
    <span><strong>No internet connection</strong><small>Checkout and order actions are paused.</small></span>
    <button type="button" onClick={() => window.location.reload()}>Try again</button>
  </div>
}

