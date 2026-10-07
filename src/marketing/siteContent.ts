import { createContext, useContext } from 'react'
import { PLAY_STORE_URL } from '../lib/webAccess'
import { marketingLinks, testimonials as fallbackReviews } from './marketingContent'

// Website content managed in /admin (site_settings + site_reviews), read with plain REST so the public site
// does not need the Supabase client. If the request fails, the built-in defaults are used.

export type SiteSettings = {
  company_site: string
  instagram_url: string
  facebook_url: string
  x_url: string
  tiktok_url: string
  whatsapp_number: string
  play_store_url: string
  app_store_url: string
  play_store_qr_svg: string
  app_store_qr_svg: string
  demo_video_url: string
  demo_video_poster_url: string
}

export type SiteReview = {
  id: string
  name: string
  shop: string
  city: string
  quote: string
  rating: number
}

export type SiteContent = { settings: SiteSettings; reviews: SiteReview[] }

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  company_site: marketingLinks.companySite,
  instagram_url: marketingLinks.instagram,
  facebook_url: marketingLinks.facebook,
  x_url: marketingLinks.x,
  tiktok_url: marketingLinks.tiktok,
  whatsapp_number: marketingLinks.whatsappNumber,
  play_store_url: PLAY_STORE_URL,
  app_store_url: marketingLinks.appStore,
  play_store_qr_svg: '',
  app_store_qr_svg: '',
  demo_video_url: marketingLinks.demoVideo,
  demo_video_poster_url: '',
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  settings: DEFAULT_SITE_SETTINGS,
  reviews: fallbackReviews.map((review, index) => ({ id: `fallback-${index}`, rating: 5, ...review })),
}

const SETTINGS_COLUMNS = Object.keys(DEFAULT_SITE_SETTINGS).join(',')

async function restGet<T>(path: string): Promise<T> {
  const url = import.meta.env.VITE_SUPABASE_URL as string
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  const response = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
  if (!response.ok) throw new Error(`Site content request failed (${response.status})`)
  return (await response.json()) as T
}

/** Loads published website content. Empty values fall back to the built-in defaults. */
export async function fetchSiteContent(): Promise<SiteContent> {
  const [settingsRows, reviews] = await Promise.all([
    restGet<Partial<SiteSettings>[]>(`site_settings?id=eq.1&select=${SETTINGS_COLUMNS}`),
    restGet<SiteReview[]>('site_reviews?published=eq.true&select=id,name,shop,city,quote,rating&order=sort_order.asc,created_at.asc'),
  ])
  const stored = settingsRows[0] ?? {}
  const settings = { ...DEFAULT_SITE_SETTINGS }
  for (const key of Object.keys(settings) as Array<keyof SiteSettings>) {
    const value = stored[key]
    if (typeof value === 'string' && value.trim()) settings[key] = value.trim()
  }
  return { settings, reviews }
}

export const SiteContentContext = createContext<SiteContent>(DEFAULT_SITE_CONTENT)

export function useSiteContent(): SiteContent {
  return useContext(SiteContentContext)
}

/** Initials for a reviewer avatar, e.g. "Amaka M." -> "AM". */
export function reviewerInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'TD'
  )
}

/** A stored QR SVG as an <img> src (falls back to the bundled Google Play QR). */
export function qrImageSrc(svg: string, fallback = '/marketing/google-play-qr.svg'): string {
  return svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : fallback
}
