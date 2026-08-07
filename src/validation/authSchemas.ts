import { z } from 'zod'

const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address.')
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters.')
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

export const signUpFormSchema = signUpSchema.extend({
  confirmPassword: z.string().min(1, 'Confirm your password.'),
  agree: z.boolean().refine(Boolean, 'Accept the terms before creating your account.'),
}).superRefine((input, context) => {
  if (input.password !== input.confirmPassword) {
    context.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match.' })
  }
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
