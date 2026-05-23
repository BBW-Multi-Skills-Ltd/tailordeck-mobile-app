import type { InvoiceTemplateOption, ReceiptTemplateOption } from './settings'
import { InvoiceClassicWaveTemplate } from '../templates/invoice/invoiceClassicWave'
import { InvoiceLeftPanelTemplate } from '../templates/invoice/invoiceLeftPanel'
import { InvoiceTopCardTemplate } from '../templates/invoice/invoiceTopCard'
import { ReceiptCleanSlipTemplate } from '../templates/receipt/receiptCleanSlip'
import { ReceiptCompactBlockTemplate } from '../templates/receipt/receiptCompactBlock'
import { ReceiptMinimalLedgerTemplate } from '../templates/receipt/receiptMinimalLedger'
import type { DocumentTemplateDefinition, DocumentTemplatePayload } from '../templates/types'

export const invoiceTemplates: DocumentTemplateDefinition[] = [
  { id: 'invoice-classic-wave', kind: 'invoice', displayName: 'Classic Wave', render: InvoiceClassicWaveTemplate },
  { id: 'invoice-left-panel', kind: 'invoice', displayName: 'Left Panel', render: InvoiceLeftPanelTemplate },
  { id: 'invoice-top-card', kind: 'invoice', displayName: 'Top Card', render: InvoiceTopCardTemplate },
]

export const receiptTemplates: DocumentTemplateDefinition[] = [
  { id: 'receipt-clean-slip', kind: 'receipt', displayName: 'Clean Slip', render: ReceiptCleanSlipTemplate },
  { id: 'receipt-compact-block', kind: 'receipt', displayName: 'Compact Block', render: ReceiptCompactBlockTemplate },
  { id: 'receipt-minimal-ledger', kind: 'receipt', displayName: 'Minimal Ledger', render: ReceiptMinimalLedgerTemplate },
]

export function getInvoiceTemplate(id: InvoiceTemplateOption): DocumentTemplateDefinition {
  return invoiceTemplates.find((template) => template.id === id) ?? invoiceTemplates[0]
}

export function getReceiptTemplate(id: ReceiptTemplateOption): DocumentTemplateDefinition {
  return receiptTemplates.find((template) => template.id === id) ?? receiptTemplates[0]
}

export function renderTemplate(payload: DocumentTemplatePayload) {
  if (payload.kind === 'invoice') {
    return getInvoiceTemplate(payload.templateId as InvoiceTemplateOption).render(payload)
  }
  return getReceiptTemplate(payload.templateId as ReceiptTemplateOption).render(payload)
}

