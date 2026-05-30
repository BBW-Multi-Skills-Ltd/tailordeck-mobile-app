import type { ReactElement } from 'react'
import { renderTemplate } from '../../lib/docTemplates'
import { loadTailorSettings, type DocumentTemplateOption, type SocialHandle } from '../../lib/settings'
import { formatDateShort, formatNaira } from '../../lib/utils'
import type { DocumentTemplatePayload } from '../../templates/types'

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
  socialHandles: SocialHandle[]
  includeBusinessDetails: {
    phone: boolean
    email: boolean
    website: boolean
    social: boolean
    address: boolean
  }
  documentTemplate: DocumentTemplateOption
  logoUrl: string
  signatureUrl: string
}

export function normalizeNigerianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('234')) return digits
  if (digits.startsWith('0')) return `234${digits.slice(1)}`
  return `234${digits}`
}

export function buildWhatsAppURL(phone: string, message: string): string {
  const normalized = normalizeNigerianPhone(phone)
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

export function readBrandConfig(): BrandConfig {
  const settings = loadTailorSettings()
  return {
    shopName: settings.businessInfo.shopName || settings.brand.name,
    primaryColor: settings.brand.colors[0],
    secondaryColor: settings.brand.colors[1],
    accentColor: settings.brand.colors[2],
    shopAddress: settings.businessInfo.shopAddress,
    businessPhone: settings.businessInfo.businessPhone,
    businessEmail: settings.businessInfo.businessEmail,
    website: settings.businessInfo.website,
    socialHandles: settings.businessInfo.socialHandles,
    includeBusinessDetails: settings.brand.includeBusinessDetails,
    documentTemplate: settings.brand.documentTemplate,
    logoUrl: settings.brand.logoUrl,
    signatureUrl: settings.brand.signatureUrl,
  }
}

export function buildDocumentShareText(params: {
  type: InvoiceType
  shopName: string
  clientName: string
  clientPhone: string
  service: string
  charge: number
  deposit: number
  balance: number
  deadlineDate: string
}): string {
  const { type, shopName, clientName, clientPhone, service, charge, deposit, balance, deadlineDate } = params
  const heading = type === 'invoice' ? 'INVOICE' : 'RECEIPT'

  return [
    `${shopName} ${heading}`,
    '',
    `Client: ${clientName}`,
    `Phone: ${clientPhone}`,
    `Service: ${service}`,
    `Charge: ${formatNaira(charge)}`,
    `Deposit: ${formatNaira(deposit)}`,
    type === 'invoice' ? `Balance to Pay: ${formatNaira(balance)}` : `Amount Received: ${formatNaira(charge)}`,
    `Delivery Date: ${formatDateShort(deadlineDate)}`,
  ].join('\n')
}

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
      socialHandles: brand.socialHandles,
      includeBusinessDetails: brand.includeBusinessDetails,
    },
  }

  return <div className="stack gap-12">{renderTemplate(templatePayload)}</div>
}
