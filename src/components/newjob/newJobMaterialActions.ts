import type { Dispatch, KeyboardEvent, SetStateAction } from 'react'

type MaterialActionParams = {
  depositPercent: string
  setAmendmentNeedsMaterials: (value: boolean) => void
  setAmendmentPartName: (value: string) => void
  setAmendmentPartQuantity: (value: string) => void
  setCustomMaterialType: (value: string) => void
  setDepositPercent: Dispatch<SetStateAction<string>>
  setMaterialColor: (value: string) => void
  setMaterialType: (value: string) => void
  setMaterialYards: (value: string) => void
  setReferencePhotoFiles: (value: File[]) => void
  setReferencePhotoNames: (value: string[]) => void
}

export function createMaterialActions({
  depositPercent,
  setAmendmentNeedsMaterials,
  setAmendmentPartName,
  setAmendmentPartQuantity,
  setCustomMaterialType,
  setDepositPercent,
  setMaterialColor,
  setMaterialType,
  setMaterialYards,
  setReferencePhotoFiles,
  setReferencePhotoNames,
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

  function handleReferencePhotoUpload(files: FileList | null): void {
    const nextFiles = files ? Array.from(files).slice(0, 3) : []
    setReferencePhotoFiles(nextFiles)
    setReferencePhotoNames(nextFiles.map((file) => file.name))
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
