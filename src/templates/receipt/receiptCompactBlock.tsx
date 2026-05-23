import type { DocumentTemplatePayload } from '../types'
import { SimpleDocumentTemplate } from '../shared/simpleDocumentTemplate'

export function ReceiptCompactBlockTemplate(payload: DocumentTemplatePayload) {
  return SimpleDocumentTemplate(payload, 'RECEIPT - COMPACT BLOCK')
}

