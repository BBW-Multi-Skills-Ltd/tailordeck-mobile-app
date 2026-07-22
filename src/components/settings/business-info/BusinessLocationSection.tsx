import { MapPin } from 'lucide-react'
import type { BusinessLocationSectionProps } from './BusinessInfoTypes'

export function BusinessLocationSection({ onShopAddressChange, settings }: BusinessLocationSectionProps) {
  return (
    <section className="clay-card business-form-card">
      <p className="business-form-card-title row gap-6"><MapPin size={15} />Shop Location</p>
      <textarea className="input settings-textarea settings-business-input" placeholder="Shop address" value={settings.businessInfo.shopAddress} onChange={(event) => onShopAddressChange(event.target.value)} />
    </section>
  )
}
