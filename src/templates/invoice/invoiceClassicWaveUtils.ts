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
  const showAllPreviewSlots = payload.previewMode === 'settings'
  const details = showAllPreviewSlots
    ? {
        phone: true,
        email: true,
        website: true,
        social: true,
        address: true,
        cac: true,
      }
    : payload.brand.includeBusinessDetails

  return {
    businessAddress: payload.brand.shopAddress,
    cacRegistrationNumber: payload.brand.cacRegistrationNumber,
    businessEmail: payload.brand.businessEmail,
    businessPhone: payload.brand.businessPhone,
    details,
    previewPlaceholders: showAllPreviewSlots,
    socialHandles: details.social ? payload.brand.socialHandles : [],
    website: payload.brand.website,
  }
}

export function getClassicWaveLineItems(payload: DocumentTemplatePayload): DocumentTemplateLineItem[] {
  if (payload.lineItems && payload.lineItems.length > 0) return payload.lineItems
  return payload.service || payload.charge
    ? [{ description: payload.service, details: '', qty: 1, unitPrice: payload.charge, total: payload.charge }]
    : []
}
