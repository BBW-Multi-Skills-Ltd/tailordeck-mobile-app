import type { LucideIcon } from 'lucide-react'

type ManagePlanRowProps = {
  icon: LucideIcon
  title: string
  desc: string
  value?: string
  tone?: 'default' | 'danger' | 'success'
}

export function ManagePlanRow({ desc, icon: Icon, title, tone = 'default', value }: ManagePlanRowProps) {
  return (
    <div className="more-row manage-plan-info-row">
      <span className={`more-row-icon clay-inset manage-plan-row-icon ${tone}`}>
        <Icon size={18} />
      </span>
      <span className="stack gap-2 min-w-0 flex-1">
        <span className="more-row-label">{title}</span>
        <span className="more-row-desc">{desc}</span>
      </span>
      {value ? <strong className="manage-plan-row-value">{value}</strong> : null}
    </div>
  )
}
