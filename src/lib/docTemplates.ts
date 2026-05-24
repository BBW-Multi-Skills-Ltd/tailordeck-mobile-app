import { InvoiceClassicWaveTemplate } from '../templates/invoice/invoiceClassicWave'
import type { DocumentTemplateDefinition, DocumentTemplatePayload } from '../templates/types'

export const documentTemplate: DocumentTemplateDefinition = {
  id: 'classic-wave',
  kind: 'invoice',
  displayName: 'Classic Wave',
  render: InvoiceClassicWaveTemplate,
}

export function renderTemplate(payload: DocumentTemplatePayload) {
  return documentTemplate.render(payload)
}

