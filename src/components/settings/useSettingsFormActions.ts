import type { Dispatch, SetStateAction } from 'react'
import type { SocialPlatform, TailorSettings } from '../../lib/settings'
import { normalizeNigeriaPhoneInput, normalizeWebsiteInput } from './settingsFormUtils'
import { addSocialHandle as addSocialHandleToSettings, removeSocialHandle as removeSocialHandleFromSettings } from './settingsSocialActions'

type UseSettingsFormActionsArgs = {
  setSettings: Dispatch<SetStateAction<TailorSettings>>
  setSocialHandleInput: Dispatch<SetStateAction<string>>
  socialHandleInput: string
  socialPlatform: SocialPlatform
}

export function useSettingsFormActions({
  setSettings,
  setSocialHandleInput,
  socialHandleInput,
  socialPlatform,
}: UseSettingsFormActionsArgs) {
  function updateColor(index: 0 | 1, value: string): void {
    setSettings((prev) => {
      const colors: [string, string, string] = [...prev.brand.colors] as [string, string, string]
      colors[index] = value
      return { ...prev, brand: { ...prev.brand, colors } }
    })
  }

  function handleProfilePhoneChange(value: string): void {
    setSettings((prev) => ({ ...prev, profile: { ...prev.profile, phone: normalizeNigeriaPhoneInput(value) } }))
  }

  function handleBusinessPhoneChange(value: string): void {
    setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, businessPhone: normalizeNigeriaPhoneInput(value) } }))
  }

  function handleWebsiteChange(value: string): void {
    setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, website: normalizeWebsiteInput(value) } }))
  }

  function addSocialHandle(): void {
    addSocialHandleToSettings({ setSettings, setSocialHandleInput, socialHandleInput, socialPlatform })
  }

  function removeSocialHandle(id: string): void {
    removeSocialHandleFromSettings(id, setSettings)
  }

  function toggleBrandDetail(key: keyof TailorSettings['brand']['includeBusinessDetails']): void {
    setSettings((prev) => ({
      ...prev,
      brand: {
        ...prev.brand,
        includeBusinessDetails: {
          ...prev.brand.includeBusinessDetails,
          [key]: !prev.brand.includeBusinessDetails[key],
        },
      },
    }))
  }

  return {
    addSocialHandle,
    handleBusinessPhoneChange,
    handleProfilePhoneChange,
    handleWebsiteChange,
    removeSocialHandle,
    toggleBrandDetail,
    updateColor,
  }
}
