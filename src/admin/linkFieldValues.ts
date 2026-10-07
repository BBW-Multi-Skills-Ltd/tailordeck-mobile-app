// Link / phone inputs with a fixed, non-editable prefix (e.g. "https://tiktok.com/@" or "+234").
// The admin types only the handle, ID or number; the full value is built on save.

export type PrefixedFieldSpec = {
  label: string
  /** Shown locked inside the field. For phone numbers, the display form (e.g. "+234"). */
  prefix: string
  placeholder: string
  hint?: string
  kind: 'url' | 'phone'
  /** Pulls the editable part out of a pasted full link (first capture group). */
  extract?: RegExp
  /** What the typed part may contain (checked after cleaning). */
  pattern: RegExp
  patternError: string
}

const countryDigits = (prefix: string) => prefix.replace(/\D/g, '')

const stripScheme = (value: string) => value.replace(/^https?:\/\/(www\.)?/i, '')

/** Stored value (or anything typed/pasted) -> the part the admin edits. */
export function toEditablePart(spec: PrefixedFieldSpec, input: string): string {
  const value = input.trim()
  if (!value) return ''
  if (spec.kind === 'phone') {
    const country = countryDigits(spec.prefix)
    let digits = value.replace(/\D/g, '')
    if (digits.startsWith(country) && digits.length > 10) digits = digits.slice(country.length)
    return digits.replace(/^0+/, '')
  }
  const extracted = spec.extract?.exec(value)?.[1]
  if (extracted) return extracted.replace(/\/+$/, '')
  const bare = stripScheme(value)
  const fixed = stripScheme(spec.prefix)
  let part = fixed && bare.toLowerCase().startsWith(fixed.toLowerCase()) ? bare.slice(fixed.length) : bare
  if (spec.prefix.endsWith('/') || spec.prefix.endsWith('@')) part = part.replace(/^@+/, '')
  return part.replace(/\/+$/, '')
}

/** The editable part -> the stored value ('' when empty), or an error message. */
export function buildStoredValue(spec: PrefixedFieldSpec, part: string): { value: string } | { error: string } {
  const cleaned = toEditablePart(spec, part)
  if (!cleaned) return { value: '' }
  if (!spec.pattern.test(cleaned)) return { error: `${spec.label}: ${spec.patternError}` }
  return { value: spec.kind === 'phone' ? `${countryDigits(spec.prefix)}${cleaned}` : `${spec.prefix}${cleaned}` }
}
