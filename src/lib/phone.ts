export function normalizeNigerianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('0')) return `234${digits.slice(1)}`
  if (digits.startsWith('234')) return digits
  return `234${digits}`
}

export function formatNigerianPhoneDisplay(phone: string): string {
  const normalized = normalizeNigerianPhone(phone)
  if (!normalized) return phone
  if (normalized.startsWith('234')) return `+${normalized}`
  return phone
}
