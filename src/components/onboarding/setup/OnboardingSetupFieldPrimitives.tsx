import type { ChangeEvent } from 'react'
import { Upload, type LucideIcon } from 'lucide-react'

type SetupFieldProps = {
  icon: LucideIcon
  id: string
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}

export function SetupField({ icon: Icon, id, label, onChange, placeholder, value }: SetupFieldProps) {
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

export function SetupTextarea({ icon: Icon, id, label, onChange, placeholder, value }: SetupFieldProps) {
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

export function UploadBox({ icon: Icon, label, onChange, previewUrl, uploadText }: UploadBoxProps) {
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
