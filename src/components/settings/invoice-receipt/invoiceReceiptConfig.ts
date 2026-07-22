import { BadgeCheck, Globe2, Mail, MapPin, Phone, Share2, type LucideIcon } from 'lucide-react'
import type { TailorSettings } from '../../../lib/settings'
import type { BrandDetailKey, InvoiceSetupChecklistItem } from './invoiceReceiptTypes'

export const DOCUMENT_PREVIEW_WIDTH = 1120
export const DOCUMENT_PREVIEW_HEIGHT = 792

export const detailOptions: Array<{ key: BrandDetailKey; label: string; icon: LucideIcon }> = [
  { key: 'phone', label: 'Phone', icon: Phone },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'website', label: 'Website', icon: Globe2 },
  { key: 'social', label: 'Social', icon: Share2 },
  { key: 'address', label: 'Address', icon: MapPin },
  { key: 'cac', label: 'CAC / RC', icon: BadgeCheck },
]

export function buildInvoiceSetupChecklist(settings: TailorSettings): InvoiceSetupChecklistItem[] {
  return [
    { label: 'Logo', complete: Boolean(settings.brand.logoUrl) },
    { label: 'Signature', complete: Boolean(settings.brand.signatureUrl) },
    { label: 'CAC / RC number', complete: Boolean(settings.businessInfo.cacRegistrationNumber.trim()) },
    { label: 'Business phone', complete: Boolean(settings.businessInfo.businessPhone.replace(/\D/g, '').length > 3) },
    { label: 'Business email', complete: Boolean(settings.businessInfo.businessEmail.trim()) },
    { label: 'Business website', complete: Boolean(settings.businessInfo.website.replace(/^https?:\/\//, '').trim()) },
    { label: 'Shop address', complete: Boolean(settings.businessInfo.shopAddress.trim()) },
    { label: 'Social handle', complete: settings.businessInfo.socialHandles.length > 0 },
  ]
}

export function getAvailableBusinessDetails(settings: TailorSettings): Record<BrandDetailKey, boolean> {
  return {
    address: Boolean(settings.businessInfo.shopAddress.trim()),
    cac: Boolean(settings.businessInfo.cacRegistrationNumber.trim()),
    email: Boolean(settings.businessInfo.businessEmail.trim()),
    phone: Boolean(settings.businessInfo.businessPhone.replace(/\D/g, '').length > 3),
    social: settings.businessInfo.socialHandles.length > 0,
    website: Boolean(settings.businessInfo.website.replace(/^https?:\/\//, '').trim()),
  }
}
