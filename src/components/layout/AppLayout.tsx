import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AppHeader from './AppHeader'
import BottomNav from './BottomNav'
import TrialExpiredNotice from './TrialExpiredNotice'

const HIDE_NAV_PATHS = ['/welcome', '/onboarding', '/jobs/new']

function shouldHideNav(pathname: string): boolean {
  return HIDE_NAV_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const hideNav = shouldHideNav(pathname)

  useEffect(() => {
    window.dispatchEvent(new Event('tailordeck:app-ready'))
  }, [pathname])

  return (
    <>
      <AppHeader />
      <main className={`page page-with-header${hideNav ? ' page-no-bottom-nav' : ''}`}>
        <Outlet />
      </main>
      <TrialExpiredNotice />
      {hideNav ? null : <BottomNav />}
    </>
  )
}
