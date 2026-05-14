export function getInitial(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toUpperCase()
}

export function formatNaira(amount: number): string {
  return `\u20A6${amount.toLocaleString('en-NG')}`
}

export function formatDateShort(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDueDate(deadlineDate: string): string {
  return `Due: ${formatDateShort(deadlineDate)}`
}

