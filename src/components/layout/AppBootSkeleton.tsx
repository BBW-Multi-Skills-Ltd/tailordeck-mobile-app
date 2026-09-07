import { useLocation } from 'react-router-dom'

const NO_SHELL_PREFIXES = ['/auth', '/onboarding', '/privacy-policy', '/terms-of-service']
const HIDE_NAV_PATHS = ['/welcome', '/onboarding', '/jobs/new']

function shouldUseAuthSkeleton(pathname: string): boolean {
  return NO_SHELL_PREFIXES.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

function shouldHideBottomNav(pathname: string): boolean {
  return HIDE_NAV_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export default function AppBootSkeleton() {
  const { pathname } = useLocation()

  if (shouldUseAuthSkeleton(pathname)) {
    return (
      <main className="app-boot-auth" aria-label="Loading page">
        <div className="app-boot-auth-logo skeleton" />
        <div className="app-boot-auth-title skeleton" />
        <div className="app-boot-auth-card skeleton" />
        <div className="app-boot-auth-line skeleton" />
      </main>
    )
  }

  const hideNav = shouldHideBottomNav(pathname)

  return (
    <>
      <header className="app-shell-header app-boot-header" aria-hidden="true">
        <div className="app-shell-left">
          <span className="app-shell-logo-wrap app-boot-logo skeleton" />
          <span className="app-boot-brand skeleton" />
        </div>
        <div className="app-shell-right app-header-actions">
          <span className="app-boot-avatar skeleton" />
          <span className="app-boot-name skeleton" />
          <span className="app-boot-bell skeleton" />
        </div>
      </header>

      <main className={`page page-with-header${hideNav ? ' page-no-bottom-nav' : ''}`}>
        <section className="section stack gap-16 app-boot-page" aria-label="Loading page">
          <div className="app-boot-heading skeleton" />
          <div className="app-boot-subheading skeleton" />
          <div className="kpi-grid" aria-hidden="true">
            <div className="home-kpi-skeleton skeleton" />
            <div className="home-kpi-skeleton skeleton" />
          </div>
          <div className="home-profit-skeleton skeleton" aria-hidden="true" />
          <div className="stack gap-8" aria-hidden="true">
            <div className="home-recent-skeleton skeleton" />
            <div className="home-recent-skeleton skeleton" />
            <div className="home-recent-skeleton skeleton" />
          </div>
        </section>
      </main>

      {hideNav ? null : <div className="bottom-nav app-boot-bottom-nav" aria-hidden="true" />}
    </>
  )
}
