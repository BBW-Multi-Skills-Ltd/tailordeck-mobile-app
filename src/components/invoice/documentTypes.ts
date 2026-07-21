import type { DocumentTemplateOption, SocialHandle } from '../../lib/settings'

export type InvoiceType = 'invoice' | 'receipt'

export type BrandConfig = {
  shopName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  shopAddress: string
  businessPhone: string
  businessEmail: string
  website: string
  cacRegistrationNumber?: string
  socialHandles: SocialHandle[]
  includeBusinessDetails: {
    phone: boolean
    email: boolean
    website: boolean
    social: boolean
    address: boolean
    cac?: boolean
  }
  documentTemplate: DocumentTemplateOption
  logoUrl: string
  signatureUrl: string
}
