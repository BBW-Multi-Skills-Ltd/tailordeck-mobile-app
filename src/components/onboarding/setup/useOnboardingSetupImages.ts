import { useState, type ChangeEvent } from 'react'
import { isImageFile } from '../../../lib/formValidation'
import { readImagePreview } from './onboardingImagePreview'

type UseOnboardingSetupImagesParams = {
  clearImageError: () => void
  initialLogoUrl: string
  initialSignatureUrl: string
  showImageError: (message: string) => void
}

export function useOnboardingSetupImages({ clearImageError, initialLogoUrl, initialSignatureUrl, showImageError }: UseOnboardingSetupImagesParams) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl)
  const [signatureUrl, setSignatureUrl] = useState(initialSignatureUrl)
  const [uploadedLogo, setUploadedLogo] = useState(false)
  const [uploadedSignature, setUploadedSignature] = useState(false)

  async function handleImageUpload(field: 'logo' | 'signature', event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!isImageFile(file)) {
      showImageError('Upload an image file only.')
      return
    }

    const value = await readImagePreview(file)
    clearImageError()
    if (field === 'logo') {
      setLogoUrl(value)
      showTemporaryUploadState(setUploadedLogo)
      return
    }

    setSignatureUrl(value)
    showTemporaryUploadState(setUploadedSignature)
  }

  return { handleImageUpload, logoUrl, signatureUrl, uploadedLogo, uploadedSignature }
}

function showTemporaryUploadState(setUploaded: (value: boolean) => void): void {
  setUploaded(true)
  window.setTimeout(() => setUploaded(false), 1800)
}
