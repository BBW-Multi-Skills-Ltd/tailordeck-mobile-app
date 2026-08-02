export function formatSeconds(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds)
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function getFriendlyOtpError(error: unknown, secondsUntilExpiry: number): string {
  const rawMessage = error instanceof Error ? error.message : ''
  const message = rawMessage.toLowerCase()

  if (message.includes('expired') || secondsUntilExpiry <= 0) {
    return 'This code has expired. Please request a new code.'
  }
  if (message.includes('invalid') || message.includes('token')) {
    return 'This code is incorrect. Please check it and try again.'
  }
  if (message.includes('rate') || message.includes('security')) {
    return 'Please wait before requesting another code.'
  }
  return rawMessage || 'Unable to verify this code.'
}
