export type FieldErrors<T extends string = string> = Partial<Record<T, string>>

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function localNigerianPhone(value: string): string {
  const digits = digitsOnly(value)
  if (digits.startsWith('234')) return digits.slice(3, 13)
  if (digits.startsWith('0')) return digits.slice(1, 11)
  return digits.slice(0, 10)
}

export function isValidNigerianMobileLocal(value: string): boolean {
  const local = localNigerianPhone(value)
  return /^[789]\d{9}$/.test(local)
}

export function isValidEmailFormat(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

export function websiteLocalPart(value: string): string {
  return value.replace(/^https?:\/\//i, '').trim()
}

export function isValidWebsiteFormat(value: string): boolean {
  const local = websiteLocalPart(value)
  if (!local) return true
  return /^(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,}([/?#].*)?$/i.test(local)
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export function passwordChecks(password: string) {
  return [
    { key: 'length', label: 'At least 8 characters', passed: password.length >= 8 },
    { key: 'uppercase', label: 'One uppercase letter', passed: /[A-Z]/.test(password) },
    { key: 'number', label: 'One number', passed: /\d/.test(password) },
    { key: 'symbol', label: 'One symbol', passed: /[^A-Za-z0-9]/.test(password) },
  ] as const
}

export function passwordStrength(password: string): number {
  return passwordChecks(password).filter((check) => check.passed).length
}
