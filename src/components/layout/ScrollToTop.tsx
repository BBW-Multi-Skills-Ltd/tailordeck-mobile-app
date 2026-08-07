import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollAppToTop } from '../../lib/scroll'

export default function ScrollToTop() {
  const location = useLocation()

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    scrollAppToTop('auto')
  }, [location.key, location.pathname, location.search])

  return null
}
