import type { DocumentTemplateLineItem, DocumentTemplatePayload } from '../types'

export function getClassicWaveLabels(kind: DocumentTemplatePayload['kind']) {
  const isInvoice = kind === 'invoice'
  return {
    docIdLabel: isInvoice ? 'Invoice No' : 'Receipt No',
    docTitle: isInvoice ? 'Invoice' : 'Receipt',
    dueLabel: isInvoice ? 'Due Date' : 'Issued Date',
    isInvoice,
  }
}

export function getClassicWaveBusinessDetails(payload: DocumentTemplatePayload) {
  return {
    businessAddress: payload.brand.shopAddress || 'Lagos, Nigeria',
    cacRegistrationNumber: payload.brand.cacRegistrationNumber,
    businessEmail: payload.brand.businessEmail || 'hello@tailordeck.app',
    businessPhone: payload.brand.businessPhone || '+234 000 000 0000',
    details: payload.brand.includeBusinessDetails,
    socialHandles: payload.brand.includeBusinessDetails.social ? payload.brand.socialHandles : [],
    website: payload.brand.website || 'www.tailordeck.app',
  }
}

export function getClassicWaveLineItems(payload: DocumentTemplatePayload): DocumentTemplateLineItem[] {
  if (payload.lineItems && payload.lineItems.length > 0) return payload.lineItems
  return [{ description: payload.service || 'Tailoring service', details: '', qty: 1, unitPrice: payload.charge, total: payload.charge }]
}
