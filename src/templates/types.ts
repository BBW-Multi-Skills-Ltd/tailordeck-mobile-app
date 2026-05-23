import type { InvoiceTemplateOption, ReceiptTemplateOption, SocialHandle } from '../lib/settings'
import type { ReactElement } from 'react'

export type DocumentTemplateKind = 'invoice' | 'receipt'

export type DocumentTemplateId = InvoiceTemplateOption | ReceiptTemplateOption

export interface DocumentTemplateBrand {
  shopName: string
  logoUrl: string
  signatureUrl: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  shopAddress: string
  businessPhone: string
  businessEmail: string
  website: string
  socialHandles: SocialHandle[]
  includeBusinessDetails: {
    phone: boolean
    email: boolean
    website: boolean
    social: boolean
    address: boolean
  }
}

export interface DocumentTemplatePayload {
  kind: DocumentTemplateKind
  templateId: DocumentTemplateId
  documentId: string
  issuedDate: string
  deadlineDate: string
  clientName: string
  clientPhone: string
  service: string
  charge: number
  deposit: number
  balance: number
  brand: DocumentTemplateBrand
}

export interface DocumentTemplateDefinition {
  id: DocumentTemplateId
  kind: DocumentTemplateKind
  displayName: string
  render: (payload: DocumentTemplatePayload) => ReactElement
}
