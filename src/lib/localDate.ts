/**
 * Calendar date in the phone's own timezone (Africa/Lagos for Nigerian users) as `YYYY-MM-DD`.
 * `toISOString()` uses UTC, which is still "yesterday" between midnight and 1 AM in Lagos.
 */
export function toLocalDateKey(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** `YYYY-MM` for the phone's current month. */
export function toLocalMonthKey(date: Date = new Date()): string {
  return toLocalDateKey(date).slice(0, 7)
}
