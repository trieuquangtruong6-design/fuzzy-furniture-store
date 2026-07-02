import { useEffect } from 'react'

import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

export default function AuthBootstrap() {
  const setUser = useAuthStore((state) => state.setUser)
  const setInitialized = useAuthStore((state) => state.setInitialized)

  useEffect(() => {
    let active = true

    authService
      .me()
      .then((user) => {
        if (active) setUser(user)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setInitialized(true)
      })

    return () => {
      active = false
    }
  }, [setInitialized, setUser])

  return null
}
