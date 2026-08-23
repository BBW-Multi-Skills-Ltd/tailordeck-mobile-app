import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { saveTailorSettings, type TailorSettings } from '../../lib/settings'
import { useUploadAvatarMutation } from '../../hooks/useProfileQueries'
import { useUploadLogoMutation, useUploadSignatureMutation } from '../../hooks/useSettingsQueries'
import { getServiceErrorMessage } from '../../services/serviceHelpers'
import { preloadImage } from '../../lib/imagePreload'

export type SettingsImageField = 'avatarUrl' | 'logoUrl' | 'signatureUrl'

type UseSettingsImageUploadArgs = {
  setSettingsError: Dispatch<SetStateAction<string>>
  setSettings: Dispatch<SetStateAction<TailorSettings>>
}

export function useSettingsImageUpload({ setSettings, setSettingsError }: UseSettingsImageUploadArgs) {
  const uploadAvatarMutation = useUploadAvatarMutation()
  const uploadLogoMutation = useUploadLogoMutation()
  const uploadSignatureMutation = useUploadSignatureMutation()

  function setLocalImagePreview(field: SettingsImageField, value: string): void {
    setSettings((prev) =>
      field === 'avatarUrl'
        ? { ...prev, profile: { ...prev.profile, avatarUrl: value } }
        : { ...prev, brand: { ...prev.brand, [field]: value } },
    )
  }

  async function uploadSettingsImage(field: SettingsImageField, event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      setSettingsError('')
      const preview = await readImagePreview(file)
      if (preview) setLocalImagePreview(field, preview)

      if (field === 'avatarUrl') {
        const { signedUrl } = await uploadAvatarMutation.mutateAsync(file)
        preloadImage(signedUrl)
        setSettings((prev) => {
          const next = { ...prev, profile: { ...prev.profile, avatarUrl: signedUrl } }
          saveTailorSettings(next)
          return next
        })
        return
      }

      const { signedUrl } = field === 'logoUrl' ? await uploadLogoMutation.mutateAsync(file) : await uploadSignatureMutation.mutateAsync(file)
      preloadImage(signedUrl)
      setSettings((prev) => {
        const next = { ...prev, brand: { ...prev.brand, [field]: signedUrl } }
        saveTailorSettings(next)
        return next
      })
    } catch (error) {
      setSettingsError(getServiceErrorMessage(error, 'Unable to upload image.'))
    }
  }

  return { uploadSettingsImage }
}

function readImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('Unable to read selected image.'))
    reader.readAsDataURL(file)
  })
}
