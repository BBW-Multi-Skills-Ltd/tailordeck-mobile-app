import type { Dispatch, SetStateAction } from 'react'
import type { SocialPlatform, TailorSettings } from '../../lib/settings'

type AddSocialHandleParams = {
  setSettings: Dispatch<SetStateAction<TailorSettings>>
  setSocialHandleInput: (value: string) => void
  socialHandleInput: string
  socialPlatform: SocialPlatform
}

export function addSocialHandle({
  setSettings,
  setSocialHandleInput,
  socialHandleInput,
  socialPlatform,
}: AddSocialHandleParams): void {
  const handle = socialHandleInput.trim()
  if (!handle) return
  const normalizedHandle = handle.startsWith('@') ? handle : `@${handle}`

  setSettings((prev) => ({
    ...prev,
    businessInfo: {
      ...prev.businessInfo,
      socialHandles: [
        ...prev.businessInfo.socialHandles,
        { id: `social-${socialPlatform.toLowerCase()}-${Date.now()}`, platform: socialPlatform, handle: normalizedHandle },
      ],
    },
  }))
  setSocialHandleInput('')
}

export function removeSocialHandle(id: string, setSettings: Dispatch<SetStateAction<TailorSettings>>): void {
  setSettings((prev) => ({
    ...prev,
    businessInfo: {
      ...prev.businessInfo,
      socialHandles: prev.businessInfo.socialHandles.filter((item) => item.id !== id),
    },
  }))
}
