import { motion } from 'framer-motion'
import { Home, MoreHorizontal, Plus, Scissors, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

type NavItem = {
  label: string
  path: string
  icon: typeof Home
  activePaths?: string[]
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Jobs', path: '/jobs', icon: Scissors },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'More', path: '/more', icon: MoreHorizontal, activePaths: ['/more', '/dashboard', '/profile', '/business', '/documents', '/help', '/settings'] },
]

function isRouteActive(currentPath: string, item: NavItem): boolean {
  const paths = item.activePaths ?? [item.path]
  return paths.some((itemPath) => isPathActive(currentPath, itemPath))
}

function isPathActive(currentPath: string, itemPath: string): boolean {
  if (itemPath === '/') {
    return currentPath === '/'
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
}

export default function BottomNav() {
  const { pathname } = useLocation()
  const leftItems = navItems.slice(0, 2)
  const rightItems = navItems.slice(2)

  function renderNavItem(item: NavItem) {
    const active = isRouteActive(pathname, item)
    const Icon = item.icon

    return (
      <Link
        key={item.path}
        to={item.path}
        className="clay-nav-item"
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
      >
        <span className="clay-nav-hitbox">
          <motion.span
            className="clay-nav-icon-wrap"
            animate={{ scale: active ? 1.12 : 1, y: active ? -1 : 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            {active ? <motion.span layoutId="clayNavKnob" className="clay-nav-knob" /> : null}
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} className="clay-nav-icon" />
          </motion.span>
          <span className={`clay-nav-label${active ? ' active' : ''}`}>{item.label}</span>
        </span>
      </Link>
    )
  }

  return (
    <nav className="bottom-nav clay-nav glass safe-area-bottom" aria-label="Primary">
      <div className="clay-nav-inner">
        <div className="clay-nav-side">{leftItems.map(renderNavItem)}</div>

        <Link to="/jobs/new" className="clay-nav-fab-wrap" aria-label="Create new job">
          <motion.span
            className="clay-nav-fab clay-primary"
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', mass: 0.5, stiffness: 260, damping: 15 }}
          >
            <Plus size={27} strokeWidth={2.5} />
          </motion.span>
        </Link>

        <div className="clay-nav-side">{rightItems.map(renderNavItem)}</div>
      </div>
    </nav>
  )
}
