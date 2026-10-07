import { buildStoredValue, toEditablePart, type PrefixedFieldSpec } from '../linkFieldValues'
import type { SiteSettings } from '../../marketing/siteContent'

// Website link fields: each has a locked prefix, so the admin types only the handle, ID or number.

export type LinkKey =
  | 'play_store_url'
  | 'app_store_url'
  | 'company_site'
  | 'instagram_url'
  | 'facebook_url'
  | 'x_url'
  | 'tiktok_url'
  | 'whatsapp_number'

export type LinkField = PrefixedFieldSpec & { key: LinkKey }

const HANDLE_HINT = 'Type only the handle. Pasting a full link also works.'

export const STORE_FIELDS: LinkField[] = [
  {
    key: 'play_store_url',
    label: 'Google Play link',
    kind: 'url',
    prefix: 'https://play.google.com/store/apps/details?id=',
    placeholder: 'app.tailordeck',
    hint: 'The app’s package name.',
    extract: /play\.google\.com\/store\/apps\/details\?(?:.*&)?id=([\w.]+)/i,
    pattern: /^[a-z][\w]*(\.[a-z][\w]*)+$/i,
    patternError: 'use the package name, e.g. app.tailordeck.',
  },
  {
    key: 'app_store_url',
    label: 'App Store link',
    kind: 'url',
    prefix: 'https://apps.apple.com/app/',
    placeholder: 'tailordeck/id1234567890',
    hint: 'Leave empty until the iPhone app is live. The site shows “Coming soon”.',
    extract: /apps\.apple\.com\/(?:[a-z]{2}\/)?app\/([^?#]+)/i,
    pattern: /^([a-z0-9-]+\/)?id\d+$/i,
    patternError: 'use the app ID from the App Store link, e.g. tailordeck/id1234567890.',
  },
]

export const COMPANY_FIELDS: LinkField[] = [
  {
    key: 'company_site',
    label: 'BBW Tech Innovations website',
    kind: 'url',
    prefix: 'https://',
    placeholder: 'bbwtechinnovations.com',
    pattern: /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i,
    patternError: 'enter a web address, e.g. bbwtechinnovations.com.',
  },
  {
    key: 'instagram_url',
    label: 'Instagram',
    kind: 'url',
    prefix: 'https://instagram.com/',
    placeholder: 'tailordeck',
    hint: HANDLE_HINT,
    extract: /instagram\.com\/@?([^/?#]+)/i,
    pattern: /^[a-z0-9._]{1,30}$/i,
    patternError: 'handles use letters, numbers, dots and underscores.',
  },
  {
    key: 'facebook_url',
    label: 'Facebook',
    kind: 'url',
    prefix: 'https://facebook.com/',
    placeholder: 'tailordeck',
    hint: HANDLE_HINT,
    extract: /facebook\.com\/([^/?#]+)/i,
    pattern: /^[a-z0-9.-]{1,80}$/i,
    patternError: 'page names use letters, numbers, dots and dashes.',
  },
  {
    key: 'x_url',
    label: 'X (Twitter)',
    kind: 'url',
    prefix: 'https://x.com/',
    placeholder: 'tailordeck',
    hint: HANDLE_HINT,
    extract: /(?:x|twitter)\.com\/@?([^/?#]+)/i,
    pattern: /^[a-z0-9_]{1,15}$/i,
    patternError: 'handles use letters, numbers and underscores (up to 15).',
  },
  {
    key: 'tiktok_url',
    label: 'TikTok',
    kind: 'url',
    prefix: 'https://tiktok.com/@',
    placeholder: 'tailordeck',
    hint: HANDLE_HINT,
    extract: /tiktok\.com\/@?([^/?#]+)/i,
    pattern: /^[a-z0-9._]{1,24}$/i,
    patternError: 'handles use letters, numbers, dots and underscores.',
  },
  {
    key: 'whatsapp_number',
    label: 'WhatsApp number',
    kind: 'phone',
    prefix: '+234',
    placeholder: '8012345678',
    hint: 'The number without the first 0, e.g. 8012345678.',
    pattern: /^\d{10}$/,
    patternError: 'enter the 10 digits after +234, e.g. 8012345678.',
  },
]

export const LINK_FIELDS = [...STORE_FIELDS, ...COMPANY_FIELDS]

export type LinkParts = Record<LinkKey, string>

export function toParts(settings: SiteSettings): LinkParts {
  return Object.fromEntries(LINK_FIELDS.map((field) => [field.key, toEditablePart(field, settings[field.key])])) as LinkParts
}

/** Builds the full links from the typed parts; returns them or the first error. */
export function buildLinks(parts: LinkParts): { values: Record<LinkKey, string> } | { error: string } {
  const values = {} as Record<LinkKey, string>
  for (const field of LINK_FIELDS) {
    const built = buildStoredValue(field, parts[field.key])
    if ('error' in built) return { error: built.error }
    values[field.key] = built.value
  }
  return { values }
}
