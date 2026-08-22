import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'
import { Building2, Check, ClipboardPaste, Copy, FileBadge, Globe, Image, Mail, MapPin, PenLine, Phone } from 'lucide-react'
import type { SocialPlatform } from '../../../lib/settings'
import type { FieldErrors } from '../../../lib/formValidation'
import { socialPlatformColor, socialPlatformIcon } from '../../settings/settingsOptions'
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
  const [copiedHandle, setCopiedHandle] = useState('')
  const [copiedFeedbackPlatform, setCopiedFeedbackPlatform] = useState<SocialPlatform | null>(null)

  useEffect(() => {
    if (!copiedFeedbackPlatform) return undefined
    const timer = window.setTimeout(() => setCopiedFeedbackPlatform(null), 1600)
    return () => window.clearTimeout(timer)
  }, [copiedFeedbackPlatform])

  function copyHandle(platform: SocialPlatform, handle: string): void {
    if (!handle) return
    setCopiedHandle(handle)
    setCopiedFeedbackPlatform(platform)
    void navigator.clipboard?.writeText(handle)
  }

  function pasteHandle(platform: SocialPlatform): void {
    if (!copiedHandle) return
    onSocialHandleChange(platform, copiedHandle)
  }

  return (
    <div className="onboarding-setup-fields">
      <SetupField error={errors.businessPhone} errorKey={errorKey} icon={Phone} id="business-phone" inputMode="tel" label="Business Phone" prefix="+234" value={businessPhone} placeholder="Your business number" onChange={onBusinessPhoneChange} />
      <SetupField error={errors.businessEmail} errorKey={errorKey} icon={Mail} id="business-email" inputMode="email" label="Business Email" optional value={businessEmail} placeholder="business@email.com" onChange={onBusinessEmailChange} />
      <SetupField error={errors.website} errorKey={errorKey} icon={Globe} id="business-website" inputMode="url" label="Business Website" optional prefix="https://" value={website} placeholder="yourwebsite.com" onChange={onWebsiteChange} />
      <div className="onboarding-social-block">
        <p className="auth-label">Social Handles <span className="optional-label">Optional</span></p>
        {onboardingSocialPlatforms.map((platform) => {
          const Icon = socialPlatformIcon[platform]
          const handle = socialHandles[platform].replace(/^@+/, '')
          const copied = copiedFeedbackPlatform === platform && copiedHandle === handle && Boolean(handle)
          const canPaste = Boolean(copiedHandle) && !handle

          return (
            <label key={platform} className="onboarding-social-input">
              <Icon size={15} style={{ color: socialPlatformColor[platform] }} />
              <span>@</span>
              <input
                className="auth-input"
                type="text"
                placeholder={`${platform} handle`}
                value={handle}
                onChange={(event) => onSocialHandleChange(platform, event.target.value.replace(/^@+/, ''))}
              />
              <button
                type="button"
                className={`onboarding-social-copy${copied ? ' copied' : ''}`}
                aria-label={canPaste ? `Paste copied handle into ${platform}` : `Copy ${platform} handle`}
                disabled={!handle && !canPaste}
                onClick={(event) => {
                  event.preventDefault()
                  if (canPaste) pasteHandle(platform)
                  else copyHandle(platform, handle)
                }}
              >
                {copied ? <Check size={14} /> : canPaste ? <ClipboardPaste size={14} /> : <Copy size={14} />}
              </button>
            </label>
          )
        })}
      </div>
    </div>
  )
}
