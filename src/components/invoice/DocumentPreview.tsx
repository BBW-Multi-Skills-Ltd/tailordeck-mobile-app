import type { ReactElement } from 'react'
import { renderTemplate } from '../../lib/docTemplates'
import type { DocumentTemplatePayload } from '../../templates/types'
import type { BrandConfig, InvoiceType } from './documentTypes'
import { FitDocumentPreview } from './FitDocumentPreview'

export type { BrandConfig, InvoiceType }

export function DocumentPreview({
  type,
  brand,
  clientName,
  clientPhone,
  service,
  lineItems,
  charge,
  deposit,
  balance,
  deadlineDate,
}: {
  type: InvoiceType
  brand: BrandConfig
  clientName: string
  clientPhone: string
  service: string
  lineItems: NonNullable<DocumentTemplatePayload['lineItems']>
  charge: number
  deposit: number
  balance: number
  deadlineDate: string
}): ReactElement {
  const documentId = `${type}-${Math.abs((service + deadlineDate).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)).toString(16).slice(0, 6)}`
  const templatePayload: DocumentTemplatePayload = {
    kind: type,
    templateId: brand.documentTemplate,
    documentId,
    issuedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    deadlineDate,
    clientName,
    clientPhone,
    service,
    lineItems,
    charge,
    deposit,
    balance,
    brand: {
      shopName: brand.shopName,
      logoUrl: brand.logoUrl,
      signatureUrl: brand.signatureUrl,
      primaryColor: brand.primaryColor,
      secondaryColor: brand.secondaryColor,
      accentColor: brand.accentColor,
      shopAddress: brand.shopAddress,
      businessPhone: brand.businessPhone,
      businessEmail: brand.businessEmail,
      website: brand.website,
      cacRegistrationNumber: brand.cacRegistrationNumber ?? '',
      socialHandles: brand.socialHandles,
      includeBusinessDetails: {
        ...brand.includeBusinessDetails,
        cac: brand.includeBusinessDetails.cac ?? false,
      },
    },
  }

  return <FitDocumentPreview>{renderTemplate(templatePayload)}</FitDocumentPreview>
}
