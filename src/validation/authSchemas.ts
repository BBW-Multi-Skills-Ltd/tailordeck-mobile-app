import { z } from 'zod'

const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address.')
// Same rule as Supabase Auth (minimum length 8, "letters and digits"). Uppercase and symbols are strength hints only.
// Sign-in does not use it, so older 6-character passwords still sign in; they must meet it when changed.
export const PASSWORD_RULE_MESSAGE = 'Use at least 8 characters with letters and numbers.'
const passwordSchema = z
  .string()
  .min(8, PASSWORD_RULE_MESSAGE)
  .regex(/[A-Za-z]/, PASSWORD_RULE_MESSAGE)
  .regex(/\d/, PASSWORD_RULE_MESSAGE)
export const EMAIL_OTP_LENGTH = 8

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.'),
})

export const signUpSchema = z.object({
  fullName: z.string().trim().optional(),
  email: emailSchema,
  phone: z.string().trim().optional().default(''),
  password: passwordSchema,
})

export const passwordResetSchema = z.object({
  email: emailSchema,
})

export const emailOtpSchema = z.object({
  email: emailSchema,
  token: z.string().trim().regex(new RegExp(`^\\d{${EMAIL_OTP_LENGTH}}$`), `Enter the ${EMAIL_OTP_LENGTH}-digit code.`),
})

export const emailUpdateSchema = z.object({
  email: emailSchema,
  nonce: z.string().trim().optional(),
})

export const passwordUpdateSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirm your password.'),
  nonce: z.string().trim().optional(),
}).superRefine((input, context) => {
  if (input.password !== input.confirmPassword) {
    context.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match.' })
  }
})

export function parseAuthInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input)
  if (parsed.success) return parsed.data
  const message = parsed.error.issues[0]?.message || 'Please review your details.'
  throw new Error(message)
}
