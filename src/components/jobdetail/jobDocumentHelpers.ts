import type { BrandConfig, InvoiceType } from '../invoice/documentTypes'

export function buildDocumentNumber(type: InvoiceType, jobId: string): string {
  const prefix = type === 'invoice' ? 'INV' : 'RCT'
  return `${prefix}-${jobId.slice(0, 8).toUpperCase()}`
}

export function documentFileName(brand: BrandConfig, type: InvoiceType, jobId: string): string {
  const shopSlug = (brand.shopName || 'tailordeck')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  const jobSlug = jobId.replace(/[^a-z0-9-]+/gi, '').slice(0, 36) || 'job'
  return `${shopSlug || 'tailordeck'}-${type}-${jobSlug}.pdf`
}

export function createPdfFile(blob: Blob, brand: BrandConfig, type: InvoiceType, jobId: string): File {
  return new File([blob], documentFileName(brand, type, jobId), { type: 'application/pdf' })
}

export function canSharePdfFile(file: File): boolean {
  if (!('canShare' in navigator) || typeof navigator.canShare !== 'function') return true
  return navigator.canShare({ files: [file] })
}

export function triggerPdfDownload(blob: Blob, brand: BrandConfig, type: InvoiceType, jobId: string): void {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = documentFileName(brand, type, jobId)
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}
