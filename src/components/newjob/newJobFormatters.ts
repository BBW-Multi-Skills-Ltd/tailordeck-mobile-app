export function labelFromField(field: string): string {
  return field
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function numericValue(value: string): number {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 0
  return parsed
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatNairaInput(value: string): string {
  const digits = digitsOnly(value)
  if (!digits) return ''
  return `\u20A6${Number(digits).toLocaleString('en-NG')}`
}

export function formatPercentInput(value: string): string {
  const digits = digitsOnly(value)
  if (!digits) return ''
  const safe = Math.min(Number(digits), 100)
  return `${safe}%`
}

