import { motion } from 'framer-motion'
import { Home, LayoutDashboard, Scissors, Settings, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

type NavItem = {
  label: string
  path: string
  icon: typeof Home
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'Jobs', path: '/jobs', icon: Scissors },
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Settings', path: '/settings', icon: Settings },
]

function isRouteActive(currentPath: string, itemPath: string): boolean {
  if (itemPath === '/') {
    return currentPath === '/'
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
}

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {navItems.map((item) => {
        const active = isRouteActive(pathname, item.path)
        const Icon = item.icon

        return (
          <Link key={item.path} to={item.path} className={`nav-item${active ? ' active' : ''}`}>
            <div className="relative flex h-9 w-12 items-center justify-center rounded-2xl">
              {active ? (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'var(--primary-bg)' }}
                />
              ) : null}
              <Icon size={20} strokeWidth={2.2} className="nav-icon relative z-10" />
            </div>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
