import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface SwiperInstance {
  destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void
}

interface SwiperConstructor {
  new (selector: string, options: Record<string, unknown>): SwiperInstance | SwiperInstance[]
}

declare global {
  interface Window {
    Swiper?: SwiperConstructor
  }
}

function setupSwiper(selector: string, options: Record<string, unknown>) {
  if (!window.Swiper || !document.querySelector(selector)) return []
  const result = new window.Swiper(selector, options)
  return Array.isArray(result) ? result : [result]
}

export default function InteractionRuntime() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    const classByPath: Record<string, string> = {
      '/': 'auth-body dark',
      '/login': 'auth-body',
      '/register': 'auth-body',
      '/forgot-password': 'auth-body',
      '/reset-password': 'auth-body',
      '/otp': 'auth-body',
      '/product/1': 'details-page',
      '/product/2': 'details-page details-page2',
    }
    document.body.className = classByPath[pathname] || ''
  }, [pathname])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const likeButton = target.closest<HTMLElement>('.like-btn')
      if (likeButton) {
        likeButton.classList.toggle('animate')
        likeButton.classList.toggle('active')
        likeButton.classList.toggle('inactive')
      }

      const quantityButton = target.closest<HTMLElement>('.plus-minus .add, .plus-minus .sub')
      if (quantityButton) {
        event.preventDefault()
        const input = quantityButton.parentElement?.querySelector<HTMLInputElement>('input[type="number"]')
        if (!input) return
        const value = Number(input.value || 1)
        input.value = String(quantityButton.classList.contains('add') ? Math.min(10, value + 1) : Math.max(1, value - 1))
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }

      const trash = target.closest<HTMLElement>('.cart-product-box .trash')
      if (trash) {
        event.preventDefault()
        trash.closest<HTMLElement>('.cart-product-box')?.remove()
      }
    }

    const onChange = (event: Event) => {
      const input = event.target as HTMLInputElement
      if (input.id === 'dark-switch') {
        document.body.classList.toggle('dark', input.checked)
        if (input.checked) localStorage.setItem('layout_version', 'dark')
        else localStorage.removeItem('layout_version')
      }

      if (input.id === 'dir-switch') {
        const direction = input.checked ? 'rtl' : 'ltr'
        document.documentElement.dir = direction
        localStorage.setItem('dir', direction)
      }

      if (input.type === 'range') {
        const min = Number(input.min)
        const max = Number(input.max)
        const value = Number(input.value)
        input.style.backgroundSize = `${((value - min) * 100) / (max - min)}% 100%`
      }
    }

    const onInput = (event: Event) => {
      const input = event.target as HTMLInputElement
      if (/^five[1-5]$/.test(input.id) && input.value.length > 0) {
        const index = Number(input.id.replace('five', ''))
        if (index < 5) document.querySelector<HTMLInputElement>(`#five${index + 1}`)?.focus()
        else input.blur()
      }

      const rangeSlider = input.closest<HTMLElement>('.range-slider')
      if (rangeSlider) {
        const ranges = [...rangeSlider.querySelectorAll<HTMLInputElement>('input[type="range"]')]
        const numbers = [...rangeSlider.querySelectorAll<HTMLInputElement>('input[type="number"]')]
        if (input.type === 'range') {
          ranges.sort((first, second) => Number(first.value) - Number(second.value))
          numbers.forEach((number, index) => {
            if (ranges[index]) number.value = ranges[index].value
          })
        } else if (input.type === 'number' && ranges.length >= 2 && numbers.length >= 2) {
          const values = numbers.map((number) => Number(number.value)).sort((first, second) => first - second)
          ranges[0].value = String(values[0])
          ranges[1].value = String(values[1])
        }
      }
    }

    document.addEventListener('click', onClick)
    document.addEventListener('change', onChange)
    document.addEventListener('input', onInput)

    const darkSwitch = document.querySelector<HTMLInputElement>('#dark-switch')
    const dirSwitch = document.querySelector<HTMLInputElement>('#dir-switch')
    const isDark = localStorage.getItem('layout_version') === 'dark'
    const direction = localStorage.getItem('dir') === 'rtl' ? 'rtl' : 'ltr'
    if (darkSwitch) darkSwitch.checked = isDark
    if (dirSwitch) dirSwitch.checked = direction === 'rtl'
    document.body.classList.toggle('dark', isDark || document.body.classList.contains('dark'))
    document.documentElement.dir = direction

    const swipers: SwiperInstance[] = []
    const frame = requestAnimationFrame(() => {
      if (isDark) document.body.classList.add('dark')
      document.querySelectorAll<HTMLElement>('.cart-bag:not([aria-label])').forEach((element) => {
        element.setAttribute('aria-label', 'View cart')
      })
      const configurations: Array<[string, Record<string, unknown>]> = [
        ['.swiper.categories', { slidesPerView: 4, spaceBetween: 10, loop: true, breakpoints: { 0: { slidesPerView: 3 }, 375: { slidesPerView: 4 }, 767: { slidesPerView: 5 } } }],
        ['.swiper.offer', { slidesPerView: 1.5, spaceBetween: 20, loop: true, breakpoints: { 0: { slidesPerView: 1 }, 375: { slidesPerView: 1.2 }, 425: { slidesPerView: 1.5 }, 768: { slidesPerView: 2 } } }],
        ['.swiper.similer-product', { slidesPerView: 2, spaceBetween: 15, loop: true }],
        ['.swiper.slider-1', { slidesPerView: 1, loop: true, autoplay: { delay: 2000, disableOnInteraction: false }, pagination: { el: '.swiper-pagination', clickable: true } }],
        ['.swiper.product-1', { slidesPerView: 1.6, loop: true, pagination: { el: '.swiper-pagination', type: 'progressbar' } }],
        ['.swiper.product-2', { slidesPerView: 3, spaceBetween: 30, centeredSlides: true, loop: true, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' } }],
      ]
      configurations.forEach(([selector, options]) => {
        swipers.push(...setupSwiper(selector, options))
      })
    })

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('click', onClick)
      document.removeEventListener('change', onChange)
      document.removeEventListener('input', onInput)
      swipers.forEach((swiper) => {
        if (typeof swiper.destroy === 'function') swiper.destroy(true, true)
      })
    }
  }, [pathname])

  return null
}
