import { describe, expect, it } from 'vitest'
import { DEFAULT_SITE_SETTINGS } from '../../../marketing/siteContent'
import { buildLinks, LINK_FIELDS, toParts, type LinkKey, type LinkParts } from '../linkFields'
import { buildStoredValue, toEditablePart } from '../../linkFieldValues'

const field = (key: LinkKey) => LINK_FIELDS.find((item) => item.key === key)!

const emptyParts = Object.fromEntries(LINK_FIELDS.map((item) => [item.key, ''])) as LinkParts

describe('link fields with a locked prefix', () => {
  it('builds full links from handles only', () => {
    const result = buildLinks({
      ...emptyParts,
      play_store_url: 'app.tailordeck',
      app_store_url: 'tailordeck/id1234567890',
      company_site: 'bbwtechinnovations.com',
      instagram_url: 'tailordeck',
      facebook_url: 'tailordeck',
      x_url: 'tailordeck',
      tiktok_url: 'tailordeck',
      whatsapp_number: '8012345678',
    })
    expect(result).toEqual({
      values: {
        play_store_url: 'https://play.google.com/store/apps/details?id=app.tailordeck',
        app_store_url: 'https://apps.apple.com/app/tailordeck/id1234567890',
        company_site: 'https://bbwtechinnovations.com',
        instagram_url: 'https://instagram.com/tailordeck',
        facebook_url: 'https://facebook.com/tailordeck',
        x_url: 'https://x.com/tailordeck',
        tiktok_url: 'https://tiktok.com/@tailordeck',
        whatsapp_number: '2348012345678',
      },
    })
  })

  it('keeps empty fields empty', () => {
    expect(buildLinks(emptyParts)).toEqual({ values: emptyParts })
  })

  it('cleans pasted full links, @ signs and leading zeros', () => {
    expect(toEditablePart(field('tiktok_url'), 'https://www.tiktok.com/@tailordeck?lang=en')).toBe('tailordeck')
    expect(toEditablePart(field('tiktok_url'), '@tailordeck')).toBe('tailordeck')
    expect(toEditablePart(field('instagram_url'), 'https://instagram.com/tailordeck/?igsh=abc')).toBe('tailordeck')
    expect(toEditablePart(field('x_url'), 'https://twitter.com/tailordeck')).toBe('tailordeck')
    expect(toEditablePart(field('play_store_url'), 'https://play.google.com/store/apps/details?id=app.tailordeck&hl=en')).toBe('app.tailordeck')
    expect(toEditablePart(field('app_store_url'), 'https://apps.apple.com/ng/app/tailordeck/id1234567890')).toBe('tailordeck/id1234567890')
    expect(toEditablePart(field('company_site'), 'https://bbwtechinnovations.com/')).toBe('bbwtechinnovations.com')
    expect(toEditablePart(field('whatsapp_number'), '08012345678')).toBe('8012345678')
    expect(toEditablePart(field('whatsapp_number'), '+234 801 234 5678')).toBe('8012345678')
  })

  it('shows stored values as the editable part', () => {
    const parts = toParts({ ...DEFAULT_SITE_SETTINGS, whatsapp_number: '2348012345678', tiktok_url: 'https://tiktok.com/@tailordeck' })
    expect(parts.play_store_url).toBe('app.tailordeck')
    expect(parts.company_site).toBe('bbwtechinnovations.com')
    expect(parts.whatsapp_number).toBe('8012345678')
    expect(parts.tiktok_url).toBe('tailordeck')
  })

  it('rejects values that are not a handle, ID or number', () => {
    expect(buildStoredValue(field('whatsapp_number'), '12345')).toHaveProperty('error')
    expect(buildStoredValue(field('x_url'), 'has space')).toHaveProperty('error')
    expect(buildStoredValue(field('app_store_url'), 'tailordeck')).toHaveProperty('error')
    expect(buildStoredValue(field('company_site'), 'not a site')).toHaveProperty('error')
  })
})
