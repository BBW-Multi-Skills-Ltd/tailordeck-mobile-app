// Money is stored as integer kobo; the UI works in naira. Use the formatter that matches your unit.

export const toKobo = (naira: number): number => Math.round(Number.isFinite(naira) ? naira * 100 : 0)

export const toNaira = (kobo: number | null | undefined): number => Math.round((kobo ?? 0) / 100)

/** Formats an amount in naira, e.g. 2500 -> "₦2,500". */
export function formatNaira(naira: number | null | undefined): string {
  return `₦${(naira ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
}

/** Formats an amount stored in kobo, e.g. 250000 -> "₦2,500". */
export function formatKobo(kobo: number | null | undefined): string {
  return formatNaira(toNaira(kobo))
}
