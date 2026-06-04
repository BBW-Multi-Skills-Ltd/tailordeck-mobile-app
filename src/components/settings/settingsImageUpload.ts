import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import type { TailorSettings } from '../../lib/settings'

export function uploadSettingsImage(
  field: 'avatarUrl' | 'logoUrl' | 'signatureUrl',
  event: ChangeEvent<HTMLInputElement>,
  setSettings: Dispatch<SetStateAction<TailorSettings>>,
): void {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const result = typeof reader.result === 'string' ? reader.result : ''
    if (!result) return
    setSettings((prev) =>
      field === 'avatarUrl'
        ? { ...prev, profile: { ...prev.profile, avatarUrl: result } }
        : { ...prev, brand: { ...prev.brand, [field]: result } },
    )
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}
