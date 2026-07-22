import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, CheckCircle2, FileBadge, Globe, Image, Mail, MapPin, PenLine, Phone, Upload } from 'lucide-react'
import { loadTailorSettings, saveTailorSettings, type SocialHandle, type SocialPlatform } from '../lib/settings'

const setupSteps = ['Business', 'Brand', 'Contact'] as const
const socialPlatforms: SocialPlatform[] = ['Instagram', 'Facebook', 'TikTok']
const setupStepCopy = [
  {
    title: 'Business details',
    helper: 'Fill in the details clients will see on documents.',
  },
  {
    title: 'Brand assets',
    helper: 'Upload your logo and signature if available.',
  },
  {
    title: 'Contact details',
    helper: 'Add the best ways clients can reach you.',
  },
] as const

type SetupStatus = 'editing' | 'saving' | 'success'

export default function OnboardingSetup() {
  const navigate = useNavigate()
  const currentSettings = loadTailorSettings()
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState<SetupStatus>('editing')
  const [skipOpen, setSkipOpen] = useState(false)
  const [businessName, setBusinessName] = useState(currentSettings.businessInfo.shopName)
  const [businessAddress, setBusinessAddress] = useState(currentSettings.businessInfo.shopAddress)
  const [cacRegistrationNumber, setCacRegistrationNumber] = useState(currentSettings.businessInfo.cacRegistrationNumber)
  const [logoUrl, setLogoUrl] = useState(currentSettings.brand.logoUrl)
  const [signatureUrl, setSignatureUrl] = useState(currentSettings.brand.signatureUrl)
  const [businessPhone, setBusinessPhone] = useState(currentSettings.businessInfo.businessPhone)
  const [businessEmail, setBusinessEmail] = useState(currentSettings.businessInfo.businessEmail)
  const [website, setWebsite] = useState(currentSettings.businessInfo.website)
  const [socialHandles, setSocialHandles] = useState<Record<SocialPlatform, string>>(() => {
    const handles = currentSettings.businessInfo.socialHandles
    return {
      Instagram: handles.find((item) => item.platform === 'Instagram')?.handle ?? '',
      Facebook: handles.find((item) => item.platform === 'Facebook')?.handle ?? '',
      TikTok: handles.find((item) => item.platform === 'TikTok')?.handle ?? '',
    }
  })

  function updateSocialHandle(platform: SocialPlatform, value: string): void {
    setSocialHandles((prev) => ({ ...prev, [platform]: value }))
  }

  function handleImageUpload(field: 'logo' | 'signature', event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : ''
      if (field === 'logo') setLogoUrl(value)
      else setSignatureUrl(value)
    }
    reader.readAsDataURL(file)
  }

  function saveSetup(): void {
    const current = loadTailorSettings()
    const normalizedBusinessName = businessName.trim() || current.businessInfo.shopName
    const normalizedSocialHandles: SocialHandle[] = socialPlatforms
      .map((platform) => ({ platform, handle: socialHandles[platform].trim() }))
      .filter((item) => item.handle)
      .map((item) => ({ id: `${item.platform.toLowerCase()}-${Date.now()}`, platform: item.platform, handle: item.handle }))

    saveTailorSettings({
      ...current,
      preferences: {
        ...current.preferences,
        measurementUnit: 'inches',
      },
      businessInfo: {
        ...current.businessInfo,
        shopName: normalizedBusinessName,
        shopAddress: businessAddress.trim(),
        businessPhone: businessPhone.trim(),
        businessEmail: businessEmail.trim(),
        website: website.trim(),
        cacRegistrationNumber: cacRegistrationNumber.trim(),
        socialHandles: normalizedSocialHandles,
      },
      brand: {
        ...current.brand,
        name: normalizedBusinessName || current.brand.name,
        logoUrl,
        signatureUrl,
        includeBusinessDetails: {
          ...current.brand.includeBusinessDetails,
          phone: Boolean(businessPhone.trim()),
          email: Boolean(businessEmail.trim()),
          website: Boolean(website.trim()),
          social: normalizedSocialHandles.length > 0,
          address: Boolean(businessAddress.trim()),
          cac: Boolean(cacRegistrationNumber.trim()),
        },
      },
      updatedAt: new Date().toISOString(),
    })
  }

  function finishSetup(): void {
    setSkipOpen(false)
    saveSetup()
    setStatus('saving')
    window.setTimeout(() => setStatus('success'), 850)
  }

  function handleNext(): void {
    if (step < setupSteps.length - 1) {
      setStep((prev) => prev + 1)
      return
    }

    finishSetup()
  }

  if (status !== 'editing') {
    return (
      <main className="page-full onboarding-page onboarding-page-step">
        <div className="onboarding-shell onboarding-shell-step onboarding-setup-status">
          {status === 'saving' ? (
            <>
              <div className="onboarding-saving-orb" aria-hidden />
              <h2 className="onboarding-section-title">Setting up your shop...</h2>
              <p className="onboarding-status-copy">Preparing your TailorDeck workspace.</p>
            </>
          ) : (
            <>
              <CheckCircle2 size={76} className="onboarding-success-icon" />
              <h2 className="onboarding-section-title">Your workshop is ready</h2>
              <p className="onboarding-status-copy">Create your account next so TailorDeck can save your shop.</p>
              <button type="button" className="btn btn-primary btn-full onboarding-primary-btn" onClick={() => navigate('/auth/signup')}>
                Proceed to Sign Up
              </button>
            </>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="page-full onboarding-page onboarding-page-step">
      <div className="onboarding-shell onboarding-shell-step">
        <div className="onboarding-brand compact">
          <div className="onboarding-brand-icon" aria-hidden>
            <img src="/Tailor%20deck%20app%20icon%20for%20phone%20screen.png" alt="" className="onboarding-brand-logo" />
          </div>
          <h2 className="onboarding-section-title">Set Up Your Shop</h2>
        </div>

        <OnboardingSetupProgress step={step} />

        <div className="onboarding-setup-step-copy">
          <h3>{setupStepCopy[step].title}</h3>
          <p>{setupStepCopy[step].helper}</p>
        </div>

        <section className="onboarding-card onboarding-card-plain onboarding-card-step onboarding-setup-card">
          {step === 0 ? (
            <div className="onboarding-setup-fields">
              <SetupField icon={Building2} id="business-name" label="Business Name" value={businessName} placeholder="Enter your business name" onChange={setBusinessName} />
              <SetupTextarea icon={MapPin} id="business-address" label="Business Address" value={businessAddress} placeholder="Shop address" onChange={setBusinessAddress} />
              <SetupField icon={FileBadge} id="business-rc" label="RC Number" value={cacRegistrationNumber} placeholder="Optional registration number" onChange={setCacRegistrationNumber} />
            </div>
          ) : null}

          {step === 1 ? (
            <div className="onboarding-setup-fields">
              <UploadBox
                icon={Image}
                label="Business Logo"
                previewUrl={logoUrl}
                uploadText="Upload Logo"
                onChange={(event) => handleImageUpload('logo', event)}
              />
              <UploadBox
                icon={PenLine}
                label="Business Signature"
                previewUrl={signatureUrl}
                uploadText="Upload Signature"
                onChange={(event) => handleImageUpload('signature', event)}
              />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="onboarding-setup-fields">
              <SetupField icon={Phone} id="business-phone" label="Business Phone" value={businessPhone} placeholder="+234 801 234 5678" onChange={setBusinessPhone} />
              <SetupField icon={Mail} id="business-email" label="Business Email" value={businessEmail} placeholder="business@email.com" onChange={setBusinessEmail} />
              <SetupField icon={Globe} id="business-website" label="Business Website" value={website} placeholder="https://yourwebsite.com" onChange={setWebsite} />
              <div className="onboarding-social-block">
                <p className="auth-label">Social Handles</p>
                {socialPlatforms.map((platform) => (
                  <label key={platform} className="onboarding-social-input">
                    <span>@</span>
                    <input
                      className="auth-input"
                      type="text"
                      placeholder={`${platform} handle`}
                      value={socialHandles[platform].replace(/^@+/, '')}
                      onChange={(event) => updateSocialHandle(platform, event.target.value.replace(/^@+/, ''))}
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="onboarding-wizard-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setStep((prev) => Math.max(prev - 1, 0))} disabled={step === 0}>
              Previous
            </button>
            <button type="button" className="btn btn-primary" onClick={handleNext}>
              {step === setupSteps.length - 1 ? 'Finish Setup' : 'Next'}
            </button>
          </div>

          <button type="button" className="onboarding-skip-btn" onClick={() => setSkipOpen(true)}>
            Skip for now
          </button>
        </section>
      </div>

      {skipOpen ? (
        <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label="Skip setup confirmation" onClick={() => setSkipOpen(false)}>
          <div className="confirm-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Skip shop setup?</h3>
            <p>Completing this now helps TailorDeck prepare cleaner invoices, receipts, and business details for your clients.</p>
            <div className="confirm-actions">
              <button type="button" className="btn btn-primary" onClick={() => setSkipOpen(false)}>
                Continue Setup
              </button>
              <button type="button" className="btn btn-secondary" onClick={finishSetup}>
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

function OnboardingSetupProgress({ step }: { step: number }) {
  const percent = Math.round(((step + 1) / setupSteps.length) * 100)

  return (
    <section className="wizard-progress-card onboarding-setup-progress" aria-label={`Shop setup progress ${percent}% complete`}>
      <div className="row-between wizard-progress-head">
        <p className="wizard-progress-step">Step {step + 1}: {setupSteps[step]}</p>
        <span className="wizard-progress-percent">{percent}%</span>
      </div>
      <div className="wizard-progress-track" aria-hidden>
        <span className="wizard-progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="wizard-progress-pills">
        {setupSteps.map((label, index) => {
          const isDone = index < step
          const isActive = index === step
          return (
            <span key={label} className={`wizard-progress-pill${isDone ? ' is-done' : ''}${isActive ? ' is-active' : ''}`}>
              {isDone ? <CheckCircle2 size={12} /> : null}
              {label}
            </span>
          )
        })}
      </div>
    </section>
  )
}

type SetupFieldProps = {
  icon: typeof Building2
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
  icon: typeof Image
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
