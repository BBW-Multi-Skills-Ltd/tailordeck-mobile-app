import { useState, type ChangeEvent } from 'react'
import {
  digitsOnly,
  type FieldErrors,
  isImageFile,
  isValidEmailFormat,
  isValidNigerianMobileLocal,
  isValidWebsiteFormat,
  localNigerianPhone,
  websiteLocalPart,
} from '../../../lib/formValidation'
import { loadTailorSettings, type SocialPlatform } from '../../../lib/settings'
import { readImagePreview } from './onboardingImagePreview'
import { onboardingSetupSteps, type OnboardingSetupStatus } from './onboardingSetupConfig'
import type { OnboardingSetupFieldKey } from './OnboardingSetupFields'
import { getInitialSocialHandles, persistOnboardingSetup } from './onboardingSetupPersistence'

export function useOnboardingSetupState() {
  const currentSettings = loadTailorSettings()
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState<OnboardingSetupStatus>('editing')
  const [skipOpen, setSkipOpen] = useState(false)
  const [businessName, setBusinessNameValue] = useState(currentSettings.businessInfo.shopName)
  const [businessAddress, setBusinessAddressValue] = useState(currentSettings.businessInfo.shopAddress)
  const [cacRegistrationNumber, setCacRegistrationNumberValue] = useState(currentSettings.businessInfo.cacRegistrationNumber)
  const [logoUrl, setLogoUrl] = useState(currentSettings.brand.logoUrl)
  const [signatureUrl, setSignatureUrl] = useState(currentSettings.brand.signatureUrl)
  const [businessPhone, setBusinessPhoneValue] = useState(localNigerianPhone(currentSettings.businessInfo.businessPhone))
  const [businessEmail, setBusinessEmailValue] = useState(currentSettings.businessInfo.businessEmail)
  const [website, setWebsiteValue] = useState(websiteLocalPart(currentSettings.businessInfo.website))
  const [socialHandles, setSocialHandles] = useState<Record<SocialPlatform, string>>(getInitialSocialHandles)
  const [errors, setErrors] = useState<FieldErrors<OnboardingSetupFieldKey>>({})
  const [errorKey, setErrorKey] = useState(0)
  const [uploadedLogo, setUploadedLogo] = useState(false)
  const [uploadedSignature, setUploadedSignature] = useState(false)

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

  async function handleImageUpload(field: 'logo' | 'signature', event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!isImageFile(file)) {
      updateErrors({ image: 'Upload an image file only.' })
      return
    }

    const value = await readImagePreview(file)
    if (field === 'logo') {
      setLogoUrl(value)
      setUploadedLogo(true)
      window.setTimeout(() => setUploadedLogo(false), 1800)
      return
    }

    setSignatureUrl(value)
    setUploadedSignature(true)
    window.setTimeout(() => setUploadedSignature(false), 1800)
  }

  function validateStep(): boolean {
    if (step === 0) {
      const nextErrors: FieldErrors<OnboardingSetupFieldKey> = {}
      if (!businessName.trim()) nextErrors.businessName = 'Fill this input.'
      if (!businessAddress.trim()) nextErrors.businessAddress = 'Fill this input.'
      else if (businessAddress.trim().length < 5) nextErrors.businessAddress = 'Enter a clearer address.'
      return updateErrors(nextErrors)
    }

    if (step === 2) {
      const nextErrors: FieldErrors<OnboardingSetupFieldKey> = {}
      if (businessPhone && !isValidNigerianMobileLocal(businessPhone)) nextErrors.businessPhone = 'Enter a valid Nigerian number.'
      if (businessEmail.trim() && !isValidEmailFormat(businessEmail)) nextErrors.businessEmail = 'Enter a valid email address.'
      if (website.trim() && !isValidWebsiteFormat(website)) nextErrors.website = 'Enter a valid website.'
      return updateErrors(nextErrors)
    }

    setErrors({})
    return true
  }

  function saveSetup(skipped = false): void {
    persistOnboardingSetup({
      businessAddress,
      businessEmail,
      businessName,
      businessPhone: businessPhone ? `+234${businessPhone}` : '',
      cacRegistrationNumber,
      logoUrl,
      signatureUrl,
      socialHandles,
      website: website ? `https://${website}` : '',
    }, { skipped })
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
