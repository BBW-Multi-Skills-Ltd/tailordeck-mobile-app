function getConfiguredOtpExpirySeconds(): number {
  const rawValue = import.meta.env.VITE_EMAIL_OTP_EXPIRY_SECONDS
  const parsedValue = Number(rawValue)
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 180
}

export const OTP_EXPIRY_SECONDS = getConfiguredOtpExpirySeconds()
export const RESEND_COOLDOWN_SECONDS = 60
export const MAX_RESENDS_BEFORE_PAUSE = 3
export const RESEND_PAUSE_SECONDS = 2 * 60
export const NOTICE_TIMEOUT_MS = 3500
export const REJECTED_CODE_CLEAR_MS = 1200
