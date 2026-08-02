import {
  type FieldErrors,
  isValidEmailFormat,
  isValidNigerianMobileLocal,
  isValidWebsiteFormat,
} from '../../../lib/formValidation'
import type { OnboardingSetupFieldKey } from './OnboardingSetupFields'

type OnboardingSetupValidationInput = {
  businessAddress: string
  businessEmail: string
  businessName: string
  businessPhone: string
  step: number
  website: string
}

export function validateOnboardingSetupStep(input: OnboardingSetupValidationInput): FieldErrors<OnboardingSetupFieldKey> {
  if (input.step === 0) return validateBusinessBasics(input)
  if (input.step === 2) return validateContactDetails(input)
  return {}
}

function validateBusinessBasics(input: OnboardingSetupValidationInput): FieldErrors<OnboardingSetupFieldKey> {
  const errors: FieldErrors<OnboardingSetupFieldKey> = {}
  if (!input.businessName.trim()) errors.businessName = 'Fill this input.'
  if (!input.businessAddress.trim()) errors.businessAddress = 'Fill this input.'
  else if (input.businessAddress.trim().length < 5) errors.businessAddress = 'Enter a clearer address.'
  return errors
}

function validateContactDetails(input: OnboardingSetupValidationInput): FieldErrors<OnboardingSetupFieldKey> {
  const errors: FieldErrors<OnboardingSetupFieldKey> = {}
  if (!input.businessPhone.trim()) errors.businessPhone = 'Fill this input.'
  else if (!isValidNigerianMobileLocal(input.businessPhone)) errors.businessPhone = 'Enter a valid Nigerian number.'
  if (input.businessEmail.trim() && !isValidEmailFormat(input.businessEmail)) errors.businessEmail = 'Enter a valid email address.'
  if (input.website.trim() && !isValidWebsiteFormat(input.website)) errors.website = 'Enter a valid website.'
  return errors
}
