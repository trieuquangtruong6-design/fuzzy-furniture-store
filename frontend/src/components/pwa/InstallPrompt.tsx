import { useEffect, useRef, useState } from 'react'
import './InstallPrompt.scss'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISS_KEY = 'fuzzy-install-dismissed-at'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function isIosSafari() {
  const ua = navigator.userAgent
  const ios = /iPad|iPhone|iPod/.test(ua)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  return ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
}

function recentlyDismissed() {
  try {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY))
    return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_DURATION
  } catch {
    return false
  }
}

function rememberDismissal() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  } catch {
    // Storage can be unavailable in private browsing; dismissal still lasts this session.
  }
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [installing, setInstalling] = useState(false)
  const dismissedThisSession = useRef(false)

  useEffect(() => {
    if (!import.meta.env.PROD || isStandalone() || recentlyDismissed()) return

    const handlePrompt = (event: Event) => {
      event.preventDefault()
      if (dismissedThisSession.current) return
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    const handleInstalled = () => {
      setInstallEvent(null)
      setShowIosGuide(false)
      try { localStorage.removeItem(DISMISS_KEY) } catch { /* noop */ }
    }
    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleInstalled)

    let iosTimer: number | undefined
    if (isIosSafari()) {
      iosTimer = window.setTimeout(() => setShowIosGuide(true), 2500)
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
      if (iosTimer) window.clearTimeout(iosTimer)
    }
  }, [])

  function dismiss() {
    dismissedThisSession.current = true
    rememberDismissal()
    setInstallEvent(null)
    setShowIosGuide(false)
  }

  async function install() {
    if (!installEvent || installing) return
    setInstalling(true)
    try {
      await installEvent.prompt()
      const choice = await installEvent.userChoice
      if (choice.outcome === 'dismissed') rememberDismissal()
      setInstallEvent(null)
    } finally {
      setInstalling(false)
    }
  }

  if (!installEvent && !showIosGuide) return null

  return <div className="install-prompt" role="dialog" aria-modal="true" aria-labelledby="install-title">
    <button className="install-prompt__close" type="button" aria-label="Dismiss install prompt" onClick={dismiss}>×</button>
    <img src="/pwa/icon-192.png" alt="" />
    <div>
      <small>Fuzzy mobile app</small>
      <h2 id="install-title">Add Fuzzy to your home screen</h2>
      {showIosGuide
        ? <p>Tap the <strong>Share</strong> button in Safari, then choose <strong>Add to Home Screen</strong>.</p>
        : <p>Install for quicker access and a full-screen shopping experience.</p>}
      <div className="install-prompt__actions">
        <button className="btn gray-btn mt-0" type="button" onClick={dismiss}>Not now</button>
        {installEvent && <button className="btn theme-btn mt-0" type="button" disabled={installing} onClick={install}>{installing ? 'Opening...' : 'Install app'}</button>}
      </div>
    </div>
  </div>
}
