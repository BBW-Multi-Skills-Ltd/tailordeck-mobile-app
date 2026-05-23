import type { DocumentTemplatePayload } from '../types'
import { SimpleDocumentTemplate } from '../shared/simpleDocumentTemplate'

export function InvoiceTopCardTemplate(payload: DocumentTemplatePayload) {
  return SimpleDocumentTemplate(payload, 'INVOICE - TOP CARD')
}

