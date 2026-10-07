import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { ArrowRight, Globe, LifeBuoy, LogOut, ShieldAlert } from 'lucide-react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import AdminLogin from './AdminLogin'
import { useAdminSession, type AdminRole } from './useAdminSession'
import '../marketing/marketing.css'
import './admin.css'

const WebsiteManager = lazy(() => import('./website/WebsiteManager'))
const SupportCentre = lazy(() => import('./support/SupportCentre'))

const ADMIN_ICON_SRC = '/marketing/tailordeck-icon.png'

/** Keeps the admin area out of search results. */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    const previousTitle = document.title
    document.title = 'TailorDeck Admin'
    return () => {
      meta.remove()
      document.title = previousTitle
    }
  }, [])
}

const PORTALS: Array<{ role: AdminRole; path: string; icon: typeof Globe; title: string; copy: string }> = [
  {
    role: 'website',
    path: '/admin/website',
    icon: Globe,
    title: 'Manage website',
    copy: 'Links, store QR codes, reviews, demo video and the content shown on tailordeck.app.',
  },
  {
    role: 'support',
    path: '/admin/support',
    icon: LifeBuoy,
    title: 'Manage support',
    copy: 'Read help requests from the app, reply to users and track each ticket until it is resolved.',
  },
]

function AdminShell({ email, onSignOut, children }: { email: string; onSignOut: () => void; children: ReactNode }) {
  return (
    <div className="ad-shell">
      <header className="ad-topbar mk-clay">
        <Link to="/admin" className="ad-brand">
          <img src={ADMIN_ICON_SRC} alt="" width={30} height={30} />
          <span>
            TailorDeck <b>Admin</b>
          </span>
        </Link>
        <div className="ad-topbar-actions">
          <span className="ad-user">{email}</span>
          <button type="button" className="mk-icon-btn" onClick={onSignOut} aria-label="Sign out" title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <main className="ad-main">{children}</main>
    </div>
  )
}

function PortalChooser({ roles }: { roles: AdminRole[] }) {
  return (
    <section className="ad-portal">
      <h1>What would you like to manage?</h1>
      <div className="ad-portal-grid">
        {PORTALS.filter((portal) => roles.includes(portal.role)).map(({ path, icon: Icon, title, copy }) => (
          <Link key={path} to={path} className="ad-portal-card mk-clay">
            <span className="mk-icon-tile">
              <Icon size={22} />
            </span>
            <h2>{title}</h2>
            <p>{copy}</p>
            <span className="ad-portal-go">
              Open <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function RequireRole({ roles, role, children }: { roles: AdminRole[]; role: AdminRole; children: ReactNode }) {
  return roles.includes(role) ? <>{children}</> : <Navigate to="/admin" replace />
}

/** /admin: sign-in wall, then the areas the signed-in admin is allowed to manage. */
export default function AdminApp() {
  useNoIndex()
  const { state, signOut } = useAdminSession()
  const [holdLogin, setHoldLogin] = useState(false)

  let content: ReactNode
  if (state.status === 'loading') {
    content = <div className="ad-loading" aria-label="Loading" />
  } else if (state.status === 'signed-out' || holdLogin) {
    content = <AdminLogin onHold={setHoldLogin} />
  } else if (!state.roles.length) {
    content = (
      <div className="ad-auth">
        <div className="ad-auth-card mk-clay">
          <span className="ad-auth-icon ad-auth-icon-warning">
            <ShieldAlert size={22} />
          </span>
          <h1>No admin access</h1>
          <p className="ad-muted">{state.session.user.email} is not an admin account.</p>
          <button type="button" className="mk-btn mk-btn-secondary ad-full" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </div>
    )
  } else {
    const { roles } = state
    content = (
      <AdminShell email={state.session.user.email ?? ''} onSignOut={() => void signOut()}>
        <Routes>
          <Route index element={<PortalChooser roles={roles} />} />
          <Route
            path="website/*"
            element={
              <RequireRole roles={roles} role="website">
                <Suspense fallback={<div className="ad-loading" aria-label="Loading" />}>
                  <WebsiteManager />
                </Suspense>
              </RequireRole>
            }
          />
          {['support', 'support/:ticketId'].map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <RequireRole roles={roles} role="support">
                  <Suspense fallback={<div className="ad-loading" aria-label="Loading" />}>
                    <SupportCentre />
                  </Suspense>
                </RequireRole>
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminShell>
    )
  }

  return <div className="mk-site ad-site">{content}</div>
}
