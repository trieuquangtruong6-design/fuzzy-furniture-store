import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function IconsaxLoader() {
  const { pathname } = useLocation()

  useEffect(() => {
    let active = true
    const icons = document.querySelectorAll<HTMLElement>('.iconsax[data-icon]')

    icons.forEach((icon) => {
      const name = icon.dataset.icon?.trim().toLowerCase()
      if (!name) return

      fetch(`/fuzzy/assets/images/iconsax/${name}.svg`)
        .then((response) => response.text())
        .then((svg) => {
          if (active && icon.isConnected) icon.innerHTML = svg
        })
        .catch(() => undefined)
    })

    return () => {
      active = false
    }
  }, [pathname])

  return null
}
