import type { ChangeEvent } from 'react'
import { Check, Upload, type LucideIcon } from 'lucide-react'

type SetupFieldProps = {
  error?: string
  errorKey?: number
  icon: LucideIcon
  id: string
  label: string
  inputMode?: 'numeric' | 'email' | 'text' | 'url' | 'tel'
  value: string
  placeholder: string
  onChange: (value: string) => void
  prefix?: string
}

export function SetupField({ error, errorKey = 0, icon: Icon, id, inputMode = 'text', label, onChange, placeholder, prefix, value }: SetupFieldProps) {
  const input = (
    <input
      key={`${id}-${errorKey}`}
      id={id}
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={Boolean(error)}
      className={`auth-input${error ? ' input-invalid input-shake' : ''}${prefix ? ' auth-input-prefixed' : ''}`}
      inputMode={inputMode}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )

  return (
    <label htmlFor={id} className="onboarding-setup-field">
      <span className="onboarding-setup-field-icon" aria-hidden>
        <Icon size={17} />
      </span>
      <span className="stack gap-5 min-w-0 flex-1">
        <span className="auth-label">{label}</span>
        {prefix ? (
          <span className={`prefix-input-wrap${error ? ' input-invalid-wrap' : ''}`}>
            <span className="fixed-input-prefix">{prefix}</span>
            {input}
          </span>
        ) : input}
        {error ? <span id={`${id}-error`} className="input-error-text">{error}</span> : null}
      </span>
    </label>
  )
}

export function SetupTextarea({ error, errorKey = 0, icon: Icon, id, label, onChange, placeholder, value }: SetupFieldProps) {
  return (
    <label htmlFor={id} className="onboarding-setup-field">
      <span className="onboarding-setup-field-icon onboarding-setup-field-icon-textarea" aria-hidden>
        <Icon size={17} />
      </span>
      <span className="stack gap-5 min-w-0 flex-1">
        <span className="auth-label">{label}</span>
        <textarea
          key={`${id}-${errorKey}`}
          id={id}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          className={`auth-input onboarding-setup-textarea${error ? ' input-invalid input-shake' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {error ? <span id={`${id}-error`} className="input-error-text">{error}</span> : null}
      </span>
    </label>
  )
}

type UploadBoxProps = {
  icon: LucideIcon
  label: string
  previewUrl: string
  success?: boolean
  uploadText: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function UploadBox({ icon: Icon, label, onChange, previewUrl, success, uploadText }: UploadBoxProps) {
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
      {success ? <Check size={18} className="onboarding-upload-action success" /> : <Upload size={18} className="onboarding-upload-action" />}
    </label>
  )
}
