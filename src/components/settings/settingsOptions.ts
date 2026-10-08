import type { IconType } from 'react-icons'
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa6'
import type { SocialPlatform } from '../../lib/settings'

export const socialPlatforms: SocialPlatform[] = ['Instagram', 'Facebook', 'TikTok']

export const socialPlatformIcon: Record<SocialPlatform, IconType> = {
  Instagram: FaInstagram,
  Facebook: FaFacebookF,
  TikTok: FaTiktok,
}

export const socialPlatformColor: Record<SocialPlatform, string> = {
  Instagram: '#E1306C',
  Facebook: '#1877F2',
  TikTok: '#000000',
}
