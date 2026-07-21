import type { TailorSettings } from '../../lib/settings'
import type { DocumentTemplatePayload } from '../../templates/types'

export function buildSettingsTemplatePreviewPayload(settings: TailorSettings, kind: 'invoice' | 'receipt'): DocumentTemplatePayload {
  const charge = 370000
  const deposit = kind === 'receipt' ? charge : 120000
  const balance = kind === 'receipt' ? 0 : charge - deposit

  return {
    kind,
    templateId: settings.brand.documentTemplate,
    documentId: `TD-${kind.toUpperCase()}-012345`,
    issuedDate: '24 May 2026',
    deadlineDate: '2026-05-28',
    clientName: 'Client Name',
    clientPhone: '08012345678',
    service: 'Custom Sewing Service',
    lineItems: [
      { description: 'Tailoring Service', details: 'Preview line item', qty: 2, unitPrice: 75000, total: 150000 },
      { description: 'Fabric + Work', details: 'Preview line item', qty: 1, unitPrice: 130000, total: 130000 },
      { description: 'Finishing', details: 'Preview line item', qty: 1, unitPrice: 90000, total: 90000 },
    ],
    charge,
    deposit,
    balance,
    brand: {
      shopName: settings.businessInfo.shopName || settings.brand.name || 'TailorDeck',
      logoUrl: settings.brand.logoUrl,
      signatureUrl: settings.brand.signatureUrl,
      primaryColor: settings.brand.colors[0],
      secondaryColor: settings.brand.colors[1],
      accentColor: settings.brand.colors[0],
      shopAddress: settings.businessInfo.shopAddress,
      businessPhone: settings.businessInfo.businessPhone,
      businessEmail: settings.businessInfo.businessEmail,
      website: settings.businessInfo.website,
      cacRegistrationNumber: settings.businessInfo.cacRegistrationNumber,
      socialHandles: settings.businessInfo.socialHandles,
      includeBusinessDetails: settings.brand.includeBusinessDetails,
    },
  }
}
