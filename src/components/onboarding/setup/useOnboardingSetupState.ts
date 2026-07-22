import { useState, type ChangeEvent } from 'react'
import { loadTailorSettings, saveTailorSettings, type SocialHandle, type SocialPlatform } from '../../../lib/settings'
import { onboardingSetupSteps, onboardingSocialPlatforms, type OnboardingSetupStatus } from './onboardingSetupConfig'

export function useOnboardingSetupState() {
  const currentSettings = loadTailorSettings()
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState<OnboardingSetupStatus>('editing')
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
    const normalizedSocialHandles: SocialHandle[] = onboardingSocialPlatforms
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
    if (step < onboardingSetupSteps.length - 1) {
      setStep((prev) => prev + 1)
      return
    }

    finishSetup()
  }

  return {
    actions: {
      finishSetup,
      handleImageUpload,
      handleNext,
      setBusinessAddress,
      setBusinessEmail,
      setBusinessName,
      setBusinessPhone,
      setCacRegistrationNumber,
      setSkipOpen,
      setStep,
      setWebsite,
      updateSocialHandle,
    },
    state: {
      businessAddress,
      businessEmail,
      businessName,
      businessPhone,
      cacRegistrationNumber,
      logoUrl,
      signatureUrl,
      skipOpen,
      socialHandles,
      status,
      step,
      website,
    },
  }
}
