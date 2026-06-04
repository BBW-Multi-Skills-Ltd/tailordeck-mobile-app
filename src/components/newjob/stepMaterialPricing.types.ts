import type { KeyboardEvent } from 'react'
import type { MaterialQuality, MaterialSource } from './newJobConfig'

export type StepMaterialPricingProps = {
  isAmendmentMode: boolean
  amendmentNeedsMaterials: boolean
  showFullMaterialFlow: boolean
  showAmendmentMaterialFlow: boolean
  openMaterialCategory: string
  materialType: string
  customMaterialType: string
  materialColor: string
  materialYards: string
  materialQuality: MaterialQuality
  materialSource: MaterialSource
  amendmentPartName: string
  amendmentPartQuantity: string
  chargeAmount: string
  depositPercent: string
  depositPercentValue: number
  deposit: number
  balance: number
  referencePhotoNames: string[]
  onAmendmentMaterialsToggle: (needsMaterials: boolean) => void
  onOpenMaterialCategoryChange: (categoryId: string) => void
  onMaterialTypeChange: (value: string) => void
  onCustomMaterialTypeChange: (value: string) => void
  onMaterialColorChange: (value: string) => void
  onMaterialYardsChange: (value: string) => void
  onMaterialQualityChange: (quality: MaterialQuality) => void
  onMaterialSourceChange: (source: MaterialSource) => void
  onAmendmentPartNameChange: (value: string) => void
  onAmendmentPartQuantityChange: (value: string) => void
  onChargeAmountChange: (value: string) => void
  onDepositPercentChange: (value: string) => void
  onDepositPercentKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onReferencePhotoUpload: (files: FileList | null) => void
}
