import type { IconType } from 'react-icons'
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa6'
import { FiBell, FiBellOff, FiVolume1, FiVolume2, FiVolumeX } from 'react-icons/fi'
import type { NotificationBellOption, RingtoneOption, SocialPlatform } from '../../lib/settings'

export const ringtoneOptions: Array<{ value: RingtoneOption; icon: IconType }> = [
  { value: 'Classic Ring', icon: FiVolume2 },
  { value: 'Soft Chime', icon: FiVolume1 },
  { value: 'Pulse Tone', icon: FiVolumeX },
]

export const notificationBellOptions: Array<{ value: NotificationBellOption; icon: IconType }> = [
  { value: 'Standard Bell', icon: FiBell },
  { value: 'Soft Bell', icon: FiVolume1 },
  { value: 'Sharp Bell', icon: FiBellOff },
]

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

export const documentTemplate = { title: 'Classic Wave', subtitle: 'Single template for invoice and receipt' }

export const brandColorOptions = [
  '#7B1E37',
  '#C9A84C',
  '#1F7A8C',
  '#2D6A4F',
  '#A63D40',
  '#3B82F6',
  '#9333EA',
  '#111827',
  '#F59E0B',
  '#EF4444',
  '#10B981',
  '#6B7280',
]
