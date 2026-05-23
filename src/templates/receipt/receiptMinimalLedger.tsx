import type { DocumentTemplatePayload } from '../types'
import { SimpleDocumentTemplate } from '../shared/simpleDocumentTemplate'

export function ReceiptMinimalLedgerTemplate(payload: DocumentTemplatePayload) {
  return SimpleDocumentTemplate(payload, 'RECEIPT - MINIMAL LEDGER')
}

