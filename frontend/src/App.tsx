import AppRoutes from './routes/AppRoutes'
import IconsaxLoader from './components/common/IconsaxLoader'
import InteractionRuntime from './components/common/InteractionRuntime'
import AuthBootstrap from './components/auth/AuthBootstrap'
import ServiceWorkerRegistration from './components/pwa/ServiceWorkerRegistration'
import NetworkStatus from './components/pwa/NetworkStatus'
import InstallPrompt from './components/pwa/InstallPrompt'

function App() {
  return (
    <>
      <IconsaxLoader />
      <InteractionRuntime />
      <AuthBootstrap />
      <ServiceWorkerRegistration />
      <NetworkStatus />
      <InstallPrompt />
      <AppRoutes />
    </>
  )
}

export default App
