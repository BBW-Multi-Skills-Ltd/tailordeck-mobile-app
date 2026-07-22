import type { ChangeEvent } from 'react'
import { Building2, FileBadge, Globe, Image, Mail, MapPin, PenLine, Phone } from 'lucide-react'
import type { SocialPlatform } from '../../../lib/settings'
import { onboardingSocialPlatforms } from './onboardingSetupConfig'
import { SetupField, SetupTextarea, UploadBox } from './OnboardingSetupFieldPrimitives'

type BusinessStepFieldsProps = {
  businessAddress: string
  businessName: string
  cacRegistrationNumber: string
  onBusinessAddressChange: (value: string) => void
  onBusinessNameChange: (value: string) => void
  onCacRegistrationNumberChange: (value: string) => void
}

type BrandStepFieldsProps = {
  logoUrl: string
  signatureUrl: string
  onImageUpload: (field: 'logo' | 'signature', event: ChangeEvent<HTMLInputElement>) => void
}

type ContactStepFieldsProps = {
  businessEmail: string
  businessPhone: string
  socialHandles: Record<SocialPlatform, string>
  website: string
  onBusinessEmailChange: (value: string) => void
  onBusinessPhoneChange: (value: string) => void
  onSocialHandleChange: (platform: SocialPlatform, value: string) => void
  onWebsiteChange: (value: string) => void
}

export function BusinessStepFields({
  businessAddress,
  businessName,
  cacRegistrationNumber,
  onBusinessAddressChange,
  onBusinessNameChange,
  onCacRegistrationNumberChange,
}: BusinessStepFieldsProps) {
  return (
    <div className="onboarding-setup-fields">
      <SetupField icon={Building2} id="business-name" label="Business Name" value={businessName} placeholder="Enter your business name" onChange={onBusinessNameChange} />
      <SetupTextarea icon={MapPin} id="business-address" label="Business Address" value={businessAddress} placeholder="Shop address" onChange={onBusinessAddressChange} />
      <SetupField icon={FileBadge} id="business-rc" label="RC Number" value={cacRegistrationNumber} placeholder="Optional registration number" onChange={onCacRegistrationNumberChange} />
    </div>
  )
}

export function BrandStepFields({ logoUrl, onImageUpload, signatureUrl }: BrandStepFieldsProps) {
  return (
    <div className="onboarding-setup-fields">
      <UploadBox icon={Image} label="Business Logo" previewUrl={logoUrl} uploadText="Upload Logo" onChange={(event) => onImageUpload('logo', event)} />
      <UploadBox icon={PenLine} label="Business Signature" previewUrl={signatureUrl} uploadText="Upload Signature" onChange={(event) => onImageUpload('signature', event)} />
    </div>
  )
}

export function ContactStepFields({
  businessEmail,
  businessPhone,
  onBusinessEmailChange,
  onBusinessPhoneChange,
  onSocialHandleChange,
  onWebsiteChange,
  socialHandles,
  website,
}: ContactStepFieldsProps) {
  return (
    <div className="onboarding-setup-fields">
      <SetupField icon={Phone} id="business-phone" label="Business Phone" value={businessPhone} placeholder="+234 801 234 5678" onChange={onBusinessPhoneChange} />
      <SetupField icon={Mail} id="business-email" label="Business Email" value={businessEmail} placeholder="business@email.com" onChange={onBusinessEmailChange} />
      <SetupField icon={Globe} id="business-website" label="Business Website" value={website} placeholder="https://yourwebsite.com" onChange={onWebsiteChange} />
      <div className="onboarding-social-block">
        <p className="auth-label">Social Handles</p>
        {onboardingSocialPlatforms.map((platform) => (
          <label key={platform} className="onboarding-social-input">
            <span>@</span>
            <input
              className="auth-input"
              type="text"
              placeholder={`${platform} handle`}
              value={socialHandles[platform].replace(/^@+/, '')}
              onChange={(event) => onSocialHandleChange(platform, event.target.value.replace(/^@+/, ''))}
            />
          </label>
        ))}
      </div>
    </div>
  )
}
