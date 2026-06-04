import { loadTailorSettings } from '../../lib/settings'
import { formatDateShort, formatNaira } from '../../lib/utils'
import type { BrandConfig, InvoiceType } from './documentTypes'

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

