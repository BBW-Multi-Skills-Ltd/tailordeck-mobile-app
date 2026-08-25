import { describe, expect, it } from 'vitest'
import { getClassicWaveBusinessDetails } from '../invoiceClassicWaveUtils'
import type { DocumentTemplatePayload } from '../../types'

function makePayload(includeBusinessDetails: DocumentTemplatePayload['brand']['includeBusinessDetails']): DocumentTemplatePayload {
  return {
    kind: 'invoice',
    previewMode: 'settings',
    templateId: 'classic-wave',
    documentId: 'INV-001',
    issuedDate: '2026-08-25',
    deadlineDate: '2026-09-01',
    clientName: 'Faith Matarh',
    clientPhone: '+2349010851071',
    service: 'Agbada',
    charge: 50000,
    deposit: 20000,
    balance: 30000,
    brand: {
      shopName: 'Faith Shop',
      logoUrl: '',
      signatureUrl: '',
      primaryColor: '#7B1E37',
      secondaryColor: '#FAF8F5',
      accentColor: '#C9A84C',
      shopAddress: 'Lagos, Nigeria',
      businessPhone: '+2349010851071',
      businessEmail: 'shop@example.com',
      website: 'tailordeck.com.ng',
      cacRegistrationNumber: 'RC12345',
      socialHandles: [{ id: 'ig', platform: 'Instagram', handle: '@faithshop' }],
      includeBusinessDetails,
    },
  }
}

describe('classic wave invoice business details', () => {
  it('uses selected business detail pills even in settings preview mode', () => {
    const details = getClassicWaveBusinessDetails(makePayload({
      phone: true,
      email: false,
      website: false,
      social: false,
      address: true,
      cac: false,
    }))

    expect(details.details).toEqual({
      phone: true,
      email: false,
      website: false,
      social: false,
      address: true,
      cac: false,
    })
    expect(details.socialHandles).toEqual([])
    expect(details.previewPlaceholders).toBe(true)
  })
})
