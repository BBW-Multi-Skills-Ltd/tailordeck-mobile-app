import type { SocialPlatform } from '../../lib/settingsTypes'

export interface BusinessProfileRow {
  id: string
  user_id: string
  shop_name: string | null
  shop_address: string | null
  business_phone: string | null
  business_phone_normalized: string | null
  business_email: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export interface BusinessSocialHandleRow {
  id: string
  user_id: string
  platform: SocialPlatform
  handle: string
  created_at: string
  updated_at: string
}
