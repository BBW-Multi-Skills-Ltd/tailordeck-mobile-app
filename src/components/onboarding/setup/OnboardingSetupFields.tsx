import type { ChangeEvent } from 'react'
import { Building2, FileBadge, Globe, Image, Mail, MapPin, PenLine, Phone, Upload, type LucideIcon } from 'lucide-react'
import type { SocialPlatform } from '../../../lib/settings'
import { onboardingSocialPlatforms } from './onboardingSetupConfig'

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

type SetupFieldProps = {
  icon: LucideIcon
  id: string
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}

function SetupField({ icon: Icon, id, label, onChange, placeholder, value }: SetupFieldProps) {
  return (
    <label htmlFor={id} className="onboarding-setup-field">
      <span className="onboarding-setup-field-icon" aria-hidden>
        <Icon size={17} />
      </span>
      <span className="stack gap-5 min-w-0 flex-1">
        <span className="auth-label">{label}</span>
        <input id={id} className="auth-input" type="text" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  )
}

function SetupTextarea({ icon: Icon, id, label, onChange, placeholder, value }: SetupFieldProps) {
  return (
    <label htmlFor={id} className="onboarding-setup-field">
      <span className="onboarding-setup-field-icon onboarding-setup-field-icon-textarea" aria-hidden>
        <Icon size={17} />
      </span>
      <span className="stack gap-5 min-w-0 flex-1">
        <span className="auth-label">{label}</span>
        <textarea id={id} className="auth-input onboarding-setup-textarea" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  )
}

type UploadBoxProps = {
  icon: LucideIcon
  label: string
  previewUrl: string
  uploadText: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

function UploadBox({ icon: Icon, label, onChange, previewUrl, uploadText }: UploadBoxProps) {
  return (
    <label className="onboarding-upload-box">
      <input type="file" accept="image/*" onChange={onChange} />
      <span className="onboarding-upload-preview" aria-hidden>
        {previewUrl ? <img src={previewUrl} alt="" /> : <Icon size={20} />}
      </span>
      <span className="stack gap-2 min-w-0">
        <span className="onboarding-upload-title">{label}</span>
        <span className="onboarding-upload-copy">{uploadText}</span>
      </span>
      <Upload size={18} className="onboarding-upload-action" />
    </label>
  )
}
