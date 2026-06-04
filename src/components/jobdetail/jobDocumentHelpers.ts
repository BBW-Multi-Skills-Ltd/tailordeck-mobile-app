import type { BrandConfig, InvoiceType } from '../invoice/documentTypes'

export function documentFileName(brand: BrandConfig, type: InvoiceType, jobId: string): string {
  return `${brand.shopName.replace(/\s+/g, '-').toLowerCase()}-${type}-${jobId}.pdf`
}

export function createPdfFile(blob: Blob, brand: BrandConfig, type: InvoiceType, jobId: string): File {
  return new File([blob], documentFileName(brand, type, jobId), { type: 'application/pdf' })
}

export function canSharePdfFile(file: File): boolean {
  if (!('canShare' in navigator) || typeof navigator.canShare !== 'function') return true
  return navigator.canShare({ files: [file] })
}
