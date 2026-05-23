import type { DocumentTemplatePayload } from '../types'
import { SimpleDocumentTemplate } from '../shared/simpleDocumentTemplate'

export function InvoiceLeftPanelTemplate(payload: DocumentTemplatePayload) {
  return SimpleDocumentTemplate(payload, 'INVOICE - LEFT PANEL')
}

