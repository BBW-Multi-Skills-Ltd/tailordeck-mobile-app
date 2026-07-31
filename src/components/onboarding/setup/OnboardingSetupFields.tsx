import type { ChangeEvent } from 'react'
import { Building2, Copy, FileBadge, Globe, Image, Mail, MapPin, PenLine, Phone } from 'lucide-react'
import type { SocialPlatform } from '../../../lib/settings'
import type { FieldErrors } from '../../../lib/formValidation'
import { onboardingSocialPlatforms } from './onboardingSetupConfig'
import { SetupField, SetupTextarea, UploadBox } from './OnboardingSetupFieldPrimitives'

export type OnboardingSetupFieldKey = 'businessName' | 'businessAddress' | 'businessPhone' | 'businessEmail' | 'website' | 'image'

type BusinessStepFieldsProps = {
  businessAddress: string
  businessName: string
  cacRegistrationNumber: string
  errors: FieldErrors<OnboardingSetupFieldKey>
  errorKey: number
  onBusinessAddressChange: (value: string) => void
  onBusinessNameChange: (value: string) => void
  onCacRegistrationNumberChange: (value: string) => void
}

type BrandStepFieldsProps = {
  errors: FieldErrors<OnboardingSetupFieldKey>
  errorKey: number
  logoUrl: string
  signatureUrl: string
  uploadedLogo: boolean
  uploadedSignature: boolean
  onImageUpload: (field: 'logo' | 'signature', event: ChangeEvent<HTMLInputElement>) => void
}

type ContactStepFieldsProps = {
  businessEmail: string
  businessPhone: string
  errors: FieldErrors<OnboardingSetupFieldKey>
  errorKey: number
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
  errorKey,
  errors,
  onBusinessAddressChange,
  onBusinessNameChange,
  onCacRegistrationNumberChange,
}: BusinessStepFieldsProps) {
  return (
    <div className="onboarding-setup-fields">
      <SetupField error={errors.businessName} errorKey={errorKey} icon={Building2} id="business-name" label="Business Name" value={businessName} placeholder="Enter your business name" onChange={onBusinessNameChange} />
      <SetupTextarea error={errors.businessAddress} errorKey={errorKey} icon={MapPin} id="business-address" label="Business Address" value={businessAddress} placeholder="Shop address" onChange={onBusinessAddressChange} />
      <SetupField icon={FileBadge} id="business-rc" inputMode="numeric" label="RC Number" value={cacRegistrationNumber} placeholder="Optional registration number" onChange={onCacRegistrationNumberChange} />
    </div>
  )
}

export function BrandStepFields({ errorKey, errors, logoUrl, onImageUpload, signatureUrl, uploadedLogo, uploadedSignature }: BrandStepFieldsProps) {
  return (
    <div className="onboarding-setup-fields">
      <UploadBox icon={Image} label="Business Logo" previewUrl={logoUrl} success={uploadedLogo} uploadText={uploadedLogo ? 'Logo uploaded' : 'Upload Logo'} onChange={(event) => onImageUpload('logo', event)} />
      <UploadBox icon={PenLine} label="Business Signature" previewUrl={signatureUrl} success={uploadedSignature} uploadText={uploadedSignature ? 'Signature uploaded' : 'Upload Signature'} onChange={(event) => onImageUpload('signature', event)} />
      {errors.image ? <span key={`onboarding-image-error-${errorKey}`} className="input-error-text input-shake">{errors.image}</span> : null}
    </div>
  )
}

export function ContactStepFields({
  businessEmail,
  businessPhone,
  errorKey,
  errors,
  onBusinessEmailChange,
  onBusinessPhoneChange,
  onSocialHandleChange,
  onWebsiteChange,
  socialHandles,
  website,
}: ContactStepFieldsProps) {
  return (
    <div className="onboarding-setup-fields">
      <SetupField error={errors.businessPhone} errorKey={errorKey} icon={Phone} id="business-phone" inputMode="tel" label="Business Phone" prefix="+234" value={businessPhone} placeholder="Business WhatsApp number" onChange={onBusinessPhoneChange} />
      <SetupField error={errors.businessEmail} errorKey={errorKey} icon={Mail} id="business-email" inputMode="email" label="Business Email" optional value={businessEmail} placeholder="business@email.com" onChange={onBusinessEmailChange} />
      <SetupField error={errors.website} errorKey={errorKey} icon={Globe} id="business-website" inputMode="url" label="Business Website" optional prefix="https://" value={website} placeholder="yourwebsite.com" onChange={onWebsiteChange} />
      <div className="onboarding-social-block">
        <p className="auth-label">Social Handles <span className="optional-label">Optional</span></p>
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
            <button type="button" className="onboarding-social-copy" aria-label={`Copy ${platform} handle`} onClick={(event) => {
              event.preventDefault()
              void navigator.clipboard?.writeText(socialHandles[platform].replace(/^@+/, ''))
            }}>
              <Copy size={14} />
            </button>
          </label>
        ))}
      </div>
    </div>
  )
}
