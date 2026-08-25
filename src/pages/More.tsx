import { motion } from 'framer-motion'
import { BarChart3, BriefcaseBusiness, ChevronRight, CircleHelp, CreditCard, FileText, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SmartImage } from '../components/shared/SmartImage'
import { AVATAR_PLACEHOLDER, loadTailorSettings } from '../lib/settings'

type MoreHubItem = {
  to: string
  icon: typeof BarChart3
  label: string
  desc: string
}

type MoreHubGroup = {
  title: string
  items: MoreHubItem[]
}

const moreGroups: MoreHubGroup[] = [
  {
    title: 'Insights',
    items: [
      {
        to: '/dashboard',
        icon: BarChart3,
        label: 'Dashboard',
        desc: 'Revenue, expenses, profit, and job performance.',
      },
      {
        to: '/documents',
        icon: FileText,
        label: 'Invoices & Receipts',
        desc: 'Logo, signature, business details, and PDF previews.',
      },
      {
        to: '/business',
        icon: BriefcaseBusiness,
        label: 'Business & Shop',
        desc: 'Shop details, contact info, social handles, and CAC / RC.',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        to: '/settings',
        icon: Settings,
        label: 'Settings',
        desc: 'Profile, business info, reminders, and security.',
      },
      {
        to: '/settings/subscription',
        icon: CreditCard,
        label: 'Subscription',
        desc: 'Current plan, billing cycle, and upgrade options.',
      },
      {
        to: '/help',
        icon: CircleHelp,
        label: 'Help & Support',
        desc: 'Guides, support details, and TailorDeck guidance.',
      },
    ],
  },
]

export default function More() {
  const settings = loadTailorSettings()
  const fullName = settings.profile.fullName || 'TailorDeck User'
  const email = settings.profile.email || 'Complete your profile in Settings'
  const initial = fullName.trim().charAt(0).toUpperCase() || 'T'

  return (
    <section className="section stack gap-12 more-page">
      <Link to="/settings/security" className="clay-card more-profile-card">
        <div className="more-avatar clay-inset" aria-hidden>
          {settings.profile.avatarUrl ? (
            <SmartImage
              src={settings.profile.avatarUrl || AVATAR_PLACEHOLDER}
              alt=""
              wrapperClassName="more-avatar-image"
              fallback={<span>{initial}</span>}
            />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div className="stack gap-2 min-w-0">
          <p className="more-profile-name truncate">{fullName}</p>
          <p className="more-profile-email truncate">{email}</p>
        </div>
        <ChevronRight size={17} className="more-row-chevron more-profile-chevron" />
      </Link>

      <div className="stack gap-7">
        {moreGroups.map((group, groupIndex) => (
          <motion.section
            key={group.title}
            className="stack gap-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.05, duration: 0.22, ease: 'easeOut' }}
          >
            <p className="more-group-title">{group.title}</p>
            <div className="clay-card more-group-card">
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon
                return (
                  <Link key={`${group.title}-${item.label}`} to={item.to} className="more-row">
                    <span className="more-row-icon clay-inset">
                      <Icon size={18} />
                    </span>
                    <span className="stack gap-2 min-w-0 flex-1">
                      <span className="more-row-label">{item.label}</span>
                      <span className="more-row-desc">{item.desc}</span>
                    </span>
                    <ChevronRight size={17} className="more-row-chevron" />
                    {itemIndex < group.items.length - 1 ? <span className="more-row-divider" aria-hidden /> : null}
                  </Link>
                )
              })}
            </div>
          </motion.section>
        ))}
      </div>
    </section>
  )
}
