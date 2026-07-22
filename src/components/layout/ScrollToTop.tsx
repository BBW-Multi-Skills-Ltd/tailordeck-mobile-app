import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SCROLL_CONTAINERS = ['main.page', 'main.page-full']

export default function ScrollToTop() {
  const location = useLocation()

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

    window.requestAnimationFrame(() => {
      SCROLL_CONTAINERS.forEach((selector) => {
        document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
          element.scrollTo({ top: 0, left: 0, behavior: 'auto' })
        })
      })
    })
  }, [location.key, location.pathname, location.search])

  return null
}
