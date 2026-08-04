import type { Dispatch, KeyboardEvent, SetStateAction } from 'react'
import { isImageFile } from '../../lib/formValidation'
import type { NewJobFieldErrors } from './newJobFieldValidation'

type MaterialActionParams = {
  depositPercent: string
  setAmendmentNeedsMaterials: (value: boolean) => void
  setAmendmentPartName: (value: string) => void
  setAmendmentPartQuantity: (value: string) => void
  setCustomMaterialType: (value: string) => void
  setDepositPercent: Dispatch<SetStateAction<string>>
  setFieldErrors: Dispatch<SetStateAction<NewJobFieldErrors>>
  setMaterialColor: (value: string) => void
  setMaterialType: (value: string) => void
  setMaterialYards: (value: string) => void
  setReferencePhotoFiles: (value: File[]) => void
  setReferencePhotoFilesByTarget: Dispatch<SetStateAction<Record<string, File[]>>>
  setReferencePhotoNames: (value: string[]) => void
  setReferencePhotoNamesByTarget: Dispatch<SetStateAction<Record<string, string[]>>>
}

export function createMaterialActions({
  depositPercent,
  setAmendmentNeedsMaterials,
  setAmendmentPartName,
  setAmendmentPartQuantity,
  setCustomMaterialType,
  setDepositPercent,
  setFieldErrors,
  setMaterialColor,
  setMaterialType,
  setMaterialYards,
  setReferencePhotoFiles,
  setReferencePhotoFilesByTarget,
  setReferencePhotoNames,
  setReferencePhotoNamesByTarget,
}: MaterialActionParams) {
  function handleAmendmentMaterialsToggle(needsMaterials: boolean): void {
    setAmendmentNeedsMaterials(needsMaterials)
    if (needsMaterials) return

    setMaterialType('')
    setCustomMaterialType('')
    setMaterialColor('')
    setMaterialYards('')
    setAmendmentPartName('')
    setAmendmentPartQuantity('')
  }

  function handleReferencePhotoUpload(targetId: string, files: FileList | null, maxFiles = 2): void {
    const incomingFiles = files ? Array.from(files) : []
    const invalidFile = incomingFiles.find((file) => !isImageFile(file))

    if (invalidFile) {
      setFieldErrors((current) => ({ ...current, referencePhotos: 'Upload image files only.' }))
      return
    }

    setReferencePhotoFilesByTarget((previous) => {
      const currentFiles = previous[targetId] ?? []
      const nextTargetFiles = [...currentFiles, ...incomingFiles].slice(0, maxFiles)
      const nextByTarget = { ...previous, [targetId]: nextTargetFiles }
      setReferencePhotoFiles(Object.values(nextByTarget).flat())

      setReferencePhotoNamesByTarget((previousNames) => {
        const nextNamesByTarget = { ...previousNames, [targetId]: nextTargetFiles.map((file) => file.name) }
        setReferencePhotoNames(Object.values(nextNamesByTarget).flat())
        return nextNamesByTarget
      })

      return nextByTarget
    })
  }

  function handleDepositPercentKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Backspace' || !depositPercent) return

    const input = event.currentTarget
    const selectionStart = input.selectionStart ?? 0
    const selectionEnd = input.selectionEnd ?? 0
    const hasSelection = selectionStart !== selectionEnd
    const atEnd = selectionStart === input.value.length

    if (!hasSelection && atEnd) {
      event.preventDefault()
      setDepositPercent((prev) => prev.slice(0, -1))
    }
  }

  return {
    handleAmendmentMaterialsToggle,
    handleDepositPercentKeyDown,
    handleReferencePhotoUpload,
  }
}
