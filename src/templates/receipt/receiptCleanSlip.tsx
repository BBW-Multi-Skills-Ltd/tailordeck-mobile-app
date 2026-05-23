import type { DocumentTemplatePayload } from '../types'
import { SimpleDocumentTemplate } from '../shared/simpleDocumentTemplate'

export function ReceiptCleanSlipTemplate(payload: DocumentTemplatePayload) {
  return SimpleDocumentTemplate(payload, 'RECEIPT - CLEAN SLIP')
}

