export const toKobo = (naira: number): number => Math.round(Number.isFinite(naira) ? naira * 100 : 0)

export const toNaira = (kobo: number | null | undefined): number => Math.round((kobo ?? 0) / 100)

export function formatNaira(kobo: number | null | undefined): string {
  return `₦${toNaira(kobo).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
}

export function formatNairaFromNaira(naira: number | null | undefined): string {
  return `₦${(naira ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
}
