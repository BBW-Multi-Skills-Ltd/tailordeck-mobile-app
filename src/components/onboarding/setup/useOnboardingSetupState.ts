import { useState, type ChangeEvent } from 'react'
import { loadTailorSettings, type SocialPlatform } from '../../../lib/settings'
import { readImagePreview } from './onboardingImagePreview'
import { onboardingSetupSteps, type OnboardingSetupStatus } from './onboardingSetupConfig'
import { getInitialSocialHandles, persistOnboardingSetup } from './onboardingSetupPersistence'

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
  const [socialHandles, setSocialHandles] = useState<Record<SocialPlatform, string>>(getInitialSocialHandles)

  function updateSocialHandle(platform: SocialPlatform, value: string): void {
    setSocialHandles((prev) => ({ ...prev, [platform]: value }))
  }

  async function handleImageUpload(field: 'logo' | 'signature', event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const value = await readImagePreview(file)
    if (field === 'logo') setLogoUrl(value)
    else setSignatureUrl(value)
  }

  function saveSetup(skipped = false): void {
    persistOnboardingSetup({
      businessAddress,
      businessEmail,
      businessName,
      businessPhone,
      cacRegistrationNumber,
      logoUrl,
      signatureUrl,
      socialHandles,
      website,
    }, { skipped })
  }

  function finishSetup(skipped = false): void {
    setSkipOpen(false)
    saveSetup(skipped)
    setStatus('saving')
    window.setTimeout(() => setStatus('success'), 850)
  }

  function handleNext(): void {
    if (step < onboardingSetupSteps.length - 1) {
      setStep((prev) => prev + 1)
      return
    }

    finishSetup(false)
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
