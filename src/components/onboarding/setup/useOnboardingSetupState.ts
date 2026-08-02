import { useState } from 'react'
import {
  digitsOnly,
  type FieldErrors,
  isValidEmailFormat,
  isValidNigerianMobileLocal,
  isValidWebsiteFormat,
  localNigerianPhone,
  websiteLocalPart,
} from '../../../lib/formValidation'
import { loadTailorSettings, type SocialPlatform } from '../../../lib/settings'
import { onboardingSetupSteps, type OnboardingSetupStatus } from './onboardingSetupConfig'
import type { OnboardingSetupFieldKey } from './OnboardingSetupFields'
import { buildOnboardingSetupDraft, getInitialSocialHandles, persistOnboardingSetup } from './onboardingSetupPersistence'
import { validateOnboardingSetupStep } from './onboardingSetupValidation'
import { useOnboardingSetupImages } from './useOnboardingSetupImages'

export function useOnboardingSetupState() {
  const currentSettings = loadTailorSettings()
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState<OnboardingSetupStatus>('editing')
  const [skipOpen, setSkipOpen] = useState(false)
  const [businessName, setBusinessNameValue] = useState(currentSettings.businessInfo.shopName)
  const [businessAddress, setBusinessAddressValue] = useState(currentSettings.businessInfo.shopAddress)
  const [cacRegistrationNumber, setCacRegistrationNumberValue] = useState(currentSettings.businessInfo.cacRegistrationNumber)
  const [businessPhone, setBusinessPhoneValue] = useState(localNigerianPhone(currentSettings.businessInfo.businessPhone))
  const [businessEmail, setBusinessEmailValue] = useState(currentSettings.businessInfo.businessEmail)
  const [website, setWebsiteValue] = useState(websiteLocalPart(currentSettings.businessInfo.website))
  const [socialHandles, setSocialHandles] = useState<Record<SocialPlatform, string>>(getInitialSocialHandles)
  const [errors, setErrors] = useState<FieldErrors<OnboardingSetupFieldKey>>({})
  const [errorKey, setErrorKey] = useState(0)
  const { handleImageUpload, logoUrl, signatureUrl, uploadedLogo, uploadedSignature } = useOnboardingSetupImages({
    clearImageError: () => setErrors((prev) => ({ ...prev, image: undefined })),
    initialLogoUrl: currentSettings.brand.logoUrl,
    initialSignatureUrl: currentSettings.brand.signatureUrl,
    showImageError: (message) => updateErrors({ image: message }),
  })

  function setBusinessName(value: string): void {
    setBusinessNameValue(value)
    if (errors.businessName && value.trim()) setErrors((prev) => ({ ...prev, businessName: undefined }))
  }

  function setBusinessAddress(value: string): void {
    setBusinessAddressValue(value)
    if (errors.businessAddress && value.trim().length >= 5) setErrors((prev) => ({ ...prev, businessAddress: undefined }))
  }

  function setCacRegistrationNumber(value: string): void {
    setCacRegistrationNumberValue(digitsOnly(value).slice(0, 12))
  }

  function setBusinessPhone(value: string): void {
    const next = localNigerianPhone(value)
    setBusinessPhoneValue(next)
    if (errors.businessPhone && (!next || isValidNigerianMobileLocal(next))) setErrors((prev) => ({ ...prev, businessPhone: undefined }))
  }

  function setBusinessEmail(value: string): void {
    setBusinessEmailValue(value)
    if (errors.businessEmail && (!value.trim() || isValidEmailFormat(value))) setErrors((prev) => ({ ...prev, businessEmail: undefined }))
  }

  function setWebsite(value: string): void {
    const next = websiteLocalPart(value)
    setWebsiteValue(next)
    if (errors.website && isValidWebsiteFormat(next)) setErrors((prev) => ({ ...prev, website: undefined }))
  }

  function updateSocialHandle(platform: SocialPlatform, value: string): void {
    setSocialHandles((prev) => ({ ...prev, [platform]: value.replace(/^@+/, '') }))
  }

  function updateErrors(nextErrors: FieldErrors<OnboardingSetupFieldKey>): boolean {
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) {
      setErrorKey((prev) => prev + 1)
      return false
    }
    return true
  }

  function validateStep(): boolean {
    const nextErrors = validateOnboardingSetupStep({ businessAddress, businessEmail, businessName, businessPhone, step, website })
    return updateErrors(nextErrors)
  }

  function saveSetup(skipped = false): void {
    persistOnboardingSetup(buildOnboardingSetupDraft({
      businessAddress,
      businessEmail,
      businessName,
      businessPhone,
      cacRegistrationNumber,
      logoUrl,
      signatureUrl,
      socialHandles,
      website,
    }), { skipped })
  }

  function finishSetup(skipped = false): void {
    setSkipOpen(false)
    saveSetup(skipped)
    setStatus('saving')
    window.setTimeout(() => setStatus('success'), 850)
  }

  function handleNext(): void {
    if (!validateStep()) return
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
      errorKey,
      errors,
      logoUrl,
      signatureUrl,
      skipOpen,
      socialHandles,
      status,
      step,
      uploadedLogo,
      uploadedSignature,
      website,
    },
  }
}
