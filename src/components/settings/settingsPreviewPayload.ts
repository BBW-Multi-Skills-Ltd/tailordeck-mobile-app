import type { TailorSettings } from '../../lib/settings'
import type { DocumentTemplatePayload } from '../../templates/types'

export function buildSettingsTemplatePreviewPayload(settings: TailorSettings, kind: 'invoice' | 'receipt'): DocumentTemplatePayload {
  return {
    kind,
    previewMode: 'settings',
    templateId: settings.brand.documentTemplate,
    documentId: '',
    issuedDate: '',
    deadlineDate: '',
    clientName: '',
    clientPhone: '',
    service: '',
    lineItems: [],
    charge: 0,
    deposit: 0,
    balance: 0,
    brand: {
      shopName: settings.businessInfo.shopName || settings.brand.name || '',
      logoUrl: isDefaultTailorDeckLogo(settings.brand.logoUrl) ? '' : settings.brand.logoUrl,
      signatureUrl: settings.brand.signatureUrl,
      primaryColor: settings.brand.colors[0],
      secondaryColor: settings.brand.colors[1],
      accentColor: settings.brand.colors[2],
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

function isDefaultTailorDeckLogo(logoUrl: string): boolean {
  return logoUrl.includes('/branding/TailorDeck app logo for in app.png')
}
