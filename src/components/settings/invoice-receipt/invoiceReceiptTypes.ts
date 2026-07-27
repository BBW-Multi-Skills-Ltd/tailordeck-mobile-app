import type { ChangeEvent } from 'react'
import type { TailorSettings } from '../../../lib/settings'

export type BrandDetailKey = keyof TailorSettings['brand']['includeBusinessDetails']

export type InvoiceReceiptPanelProps = {
  settings: TailorSettings
  saved: boolean
  locked?: boolean
  onFileUpload: (field: 'logoUrl' | 'signatureUrl', event: ChangeEvent<HTMLInputElement>) => void
  onUpgrade?: () => void
  onToggleBrandDetail: (key: BrandDetailKey) => void
  onSave: () => void
}

export type InvoiceSetupChecklistItem = {
  label: string
  complete: boolean
}
