export function getRelativeTime(iso: string): string {
  const value = new Date(iso).getTime()
  if (Number.isNaN(value)) return ''

  const diffMinutes = Math.round((value - Date.now()) / 60000)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const absMinutes = Math.abs(diffMinutes)
  if (absMinutes < 60) return formatter.format(diffMinutes, 'minute')

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, 'hour')

  return formatter.format(Math.round(diffHours / 24), 'day')
}
