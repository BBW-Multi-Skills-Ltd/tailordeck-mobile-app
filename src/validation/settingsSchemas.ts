import { z } from 'zod'

const optionalText = z.string().trim().optional().nullable()
const optionalUrl = z.string().trim().optional().nullable()
const hexColor = z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, 'Use a valid hex color.').optional().nullable()

export const fileUploadSchema = z.custom<File>((value) => {
  if (typeof File === 'undefined') return true
  return value instanceof File
}, 'Choose a valid file.').superRefine((file, context) => {
  if (typeof File === 'undefined' || !(file instanceof File)) return
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    context.addIssue({ code: 'custom', message: 'File must be 2MB or smaller.' })
  }
  if (file.type && !file.type.startsWith('image/')) {
    context.addIssue({ code: 'custom', message: 'Only image files are allowed.' })
  }
})

export const profileUpdateSchema = z.object({
  full_name: optionalText,
  email: optionalText,
  phone: optionalText,
  avatar_url: optionalText,
  avatar_storage_path: optionalText,
  onboarding_complete: z.boolean().optional(),
}).partial()

export const businessProfileUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  shop_name: optionalText,
  shop_address: optionalText,
  business_phone: optionalText,
  business_phone_normalized: optionalText,
  business_email: optionalText,
  website: optionalUrl,
  cac_registration_number: optionalText,
  created_at: optionalText,
  updated_at: optionalText,
}).partial()

export const socialHandleSchema = z.object({
  platform: z.enum(['Instagram', 'Facebook', 'TikTok']),
  handle: z.string().trim().min(1, 'Social handle cannot be empty.'),
})

export const preferencesUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  measurement_unit: z.enum(['cm', 'inches']).optional(),
  default_material_quality: z.enum(['Normal', 'Original', 'Fake', 'High Standard']).optional().nullable(),
  push_notifications: z.boolean().optional(),
  default_reminder: z.enum(['1 day before', '3 days before', '1 week before']).optional(),
  ringtone_enabled: z.boolean().optional(),
  ringtone: z.enum(['Classic Ring', 'Soft Chime', 'Pulse Tone']).optional(),
  notification_bell_enabled: z.boolean().optional(),
  notification_bell: z.enum(['Standard Bell', 'Soft Bell', 'Sharp Bell']).optional(),
  created_at: optionalText,
  updated_at: optionalText,
}).partial()

export const brandSettingsUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  logo_url: optionalText,
  logo_storage_path: optionalText,
  signature_url: optionalText,
  signature_storage_path: optionalText,
  document_template: z.literal('classic-wave').optional(),
  header_color: hexColor,
  body_color: hexColor,
  accent_color: hexColor,
  show_business_phone: z.boolean().optional(),
  show_business_email: z.boolean().optional(),
  show_website: z.boolean().optional(),
  show_social: z.boolean().optional(),
  show_address: z.boolean().optional(),
  show_cac: z.boolean().optional(),
  created_at: optionalText,
  updated_at: optionalText,
}).partial()

export function parseSettingsUpdate<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input)
  if (parsed.success) return parsed.data
  const message = parsed.error.issues.map((issue) => issue.message).join(' ')
  throw new Error(message || 'Please review this form before saving.')
}
