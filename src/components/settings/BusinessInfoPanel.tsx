import type { SocialPlatform, TailorSettings } from '../../lib/settings'
import { BusinessContactSection } from './business-info/BusinessContactSection'
import { BusinessIdentitySection } from './business-info/BusinessIdentitySection'
import { BusinessLocationSection } from './business-info/BusinessLocationSection'
import { BusinessSocialSection } from './business-info/BusinessSocialSection'

type BusinessInfoPanelProps = {
  settings: TailorSettings
  businessPhoneLocalPart: string
  websiteLocalPart: string
  socialPlatform: SocialPlatform
  socialHandleInput: string
  saved: boolean
  onShopNameChange: (value: string) => void
  onBusinessPhoneChange: (value: string) => void
  onBusinessEmailChange: (value: string) => void
  onCacRegistrationNumberChange: (value: string) => void
  onWebsiteChange: (value: string) => void
  onSocialPlatformChange: (value: SocialPlatform) => void
  onSocialHandleInputChange: (value: string) => void
  onAddSocialHandle: () => void
  onRemoveSocialHandle: (id: string) => void
  onShopAddressChange: (value: string) => void
  onSave: () => void
}

export default function BusinessInfoPanel({
  settings,
  businessPhoneLocalPart,
  websiteLocalPart,
  socialPlatform,
  socialHandleInput,
  saved,
  onShopNameChange,
  onBusinessPhoneChange,
  onBusinessEmailChange,
  onCacRegistrationNumberChange,
  onWebsiteChange,
  onSocialPlatformChange,
  onSocialHandleInputChange,
  onAddSocialHandle,
  onRemoveSocialHandle,
  onShopAddressChange,
  onSave,
}: BusinessInfoPanelProps) {
  return (
    <div className="stack settings-business-form">
      <BusinessIdentitySection settings={settings} onShopNameChange={onShopNameChange} onCacRegistrationNumberChange={onCacRegistrationNumberChange} />
      <BusinessContactSection settings={settings} businessPhoneLocalPart={businessPhoneLocalPart} websiteLocalPart={websiteLocalPart} onBusinessPhoneChange={onBusinessPhoneChange} onBusinessEmailChange={onBusinessEmailChange} onWebsiteChange={onWebsiteChange} />
      <BusinessSocialSection settings={settings} socialPlatform={socialPlatform} socialHandleInput={socialHandleInput} onSocialPlatformChange={onSocialPlatformChange} onSocialHandleInputChange={onSocialHandleInputChange} onAddSocialHandle={onAddSocialHandle} onRemoveSocialHandle={onRemoveSocialHandle} />
      <BusinessLocationSection settings={settings} onShopAddressChange={onShopAddressChange} />

      <button type="button" className="btn btn-primary settings-panel-save-btn" onClick={onSave}>
        Save Business Info
      </button>
      {saved ? <p className="text-sm text-success">Business Info saved.</p> : null}
    </div>
  )
}
