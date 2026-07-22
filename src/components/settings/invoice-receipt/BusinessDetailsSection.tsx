import { ArrowRight } from 'lucide-react'
import type { TailorSettings } from '../../../lib/settings'
import { detailOptions } from './invoiceReceiptConfig'
import { SectionHeader } from './InvoiceSetupProgress'
import type { BrandDetailKey } from './invoiceReceiptTypes'

export function BusinessDetailsSection({
  availableBusinessDetails,
  onDetailClick,
  settings,
  setupNotice,
}: {
  settings: TailorSettings
  availableBusinessDetails: Record<BrandDetailKey, boolean>
  setupNotice: string
  onDetailClick: (item: { key: BrandDetailKey; label: string }) => void
}) {
  return (
    <section className="settings-document-section">
      <SectionHeader title="Business Details" helper="Choose what appears on invoice and receipt." />
      <div className="settings-business-detail-chips">
        {detailOptions.map((item) => {
          const Icon = item.icon
          const available = availableBusinessDetails[item.key]
          const active = available && settings.brand.includeBusinessDetails[item.key]
          return (
            <button
              key={item.key}
              type="button"
              className={`settings-business-detail-chip${active ? ' active' : ''}${available ? '' : ' missing'}`}
              onClick={() => onDetailClick(item)}
            >
              <span className="settings-radio-indicator" />
              <Icon size={15} className="settings-radio-icon" />
              <span>{item.label}</span>
              {!available ? <small>Set up first</small> : null}
            </button>
          )
        })}
      </div>
      {setupNotice ? <p className="settings-detail-setup-notice">{setupNotice}</p> : null}
      <p className="settings-horizontal-scroll-hint">
        Swipe for more <ArrowRight size={13} />
      </p>
    </section>
  )
}
