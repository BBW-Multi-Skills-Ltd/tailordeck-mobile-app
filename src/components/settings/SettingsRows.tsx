import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type SettingsPanel = 'profile' | 'security' | 'preferences' | 'reminders' | 'business' | 'brand' | 'about' | null

type PanelKey = Exclude<SettingsPanel, null>

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      className={`settings-toggle${checked ? ' active' : ''}`}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="settings-toggle-knob" />
    </button>
  )
}

export function SettingAccordion({
  icon,
  title,
  subtitle,
  tone = 'default',
  order,
  panelKey,
  panel,
  onToggle,
  children,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  tone?: 'default' | 'danger'
  order?: number
  panelKey: PanelKey
  panel: SettingsPanel
  onToggle: (key: PanelKey) => void
  children: ReactNode
}) {
  const isOpen = panel === panelKey

  return (
    <div className={`settings-accordion-item${tone === 'danger' ? ' danger' : ''}`} style={order ? { order } : undefined}>
      <button type="button" className="settings-row-card" onClick={() => onToggle(panelKey)} aria-expanded={isOpen}>
        <div className="row gap-4">
          <span className="settings-row-icon">{icon}</span>
          <div className="stack gap-4">
            <p className="settings-row-title">{title}</p>
            {subtitle ? <p className="settings-row-subtitle">{subtitle}</p> : null}
          </div>
        </div>
        <ChevronRight size={17} className={`text-muted settings-row-chevron${isOpen ? ' open' : ''}`} />
      </button>

      {isOpen ? <div className="settings-accordion-panel">{children}</div> : null}
    </div>
  )
}

export function SettingLinkRow({
  icon,
  title,
  subtitle,
  href,
  tone = 'default',
  order,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  href: string
  tone?: 'default' | 'accent' | 'danger'
  order?: number
}) {
  return (
    <Link to={href} className={`settings-row-card settings-link-row${tone !== 'default' ? ` ${tone}` : ''}`} style={order ? { order } : undefined}>
      <div className="row gap-4">
        <span className="settings-row-icon">{icon}</span>
        <div className="stack gap-4">
          <p className="settings-row-title">{title}</p>
          {subtitle ? <p className="settings-row-subtitle">{subtitle}</p> : null}
        </div>
      </div>
      <ChevronRight size={17} className="text-muted" />
    </Link>
  )
}
