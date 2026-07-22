import type { SocialPlatform, TailorSettings } from '../../../lib/settings'

export type BusinessInfoPanelBaseProps = {
  settings: TailorSettings
}

export type BusinessIdentitySectionProps = BusinessInfoPanelBaseProps & {
  onCacRegistrationNumberChange: (value: string) => void
  onShopNameChange: (value: string) => void
}

export type BusinessContactSectionProps = BusinessInfoPanelBaseProps & {
  businessPhoneLocalPart: string
  websiteLocalPart: string
  onBusinessEmailChange: (value: string) => void
  onBusinessPhoneChange: (value: string) => void
  onWebsiteChange: (value: string) => void
}

export type BusinessSocialSectionProps = BusinessInfoPanelBaseProps & {
  socialHandleInput: string
  socialPlatform: SocialPlatform
  onAddSocialHandle: () => void
  onRemoveSocialHandle: (id: string) => void
  onSocialHandleInputChange: (value: string) => void
  onSocialPlatformChange: (value: SocialPlatform) => void
}

export type BusinessLocationSectionProps = BusinessInfoPanelBaseProps & {
  onShopAddressChange: (value: string) => void
}
