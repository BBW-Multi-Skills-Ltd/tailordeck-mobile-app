// Shared formatting for support tickets, used by the app (Help -> My support requests) and the admin support centre.

export type SupportStatus = 'open' | 'in_review' | 'resolved' | 'closed'

/** Wording shown to the user who sent the request. */
export const USER_SUPPORT_STATUS_LABELS: Record<SupportStatus, string> = {
  open: 'Received',
  in_review: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

/** Wording shown to support staff in the admin inbox. */
export const ADMIN_SUPPORT_STATUS_LABELS: Record<SupportStatus, string> = {
  open: 'New',
  in_review: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const SUPPORT_CATEGORY_LABELS: Record<string, string> = {
  billing: 'Billing',
  bug: 'Bug report',
  feedback: 'Feedback',
  account: 'Account',
  general: 'General',
}

/** Short ticket reference, e.g. "#1A2B3C4D". */
export function ticketNumber(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`
}

/** Date and time of a ticket or message; the year is included unless `short` is set. */
export function formatSupportDate(value: string, options: { short?: boolean } = {}): string {
  return new Date(value).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    ...(options.short ? {} : { year: 'numeric' }),
    hour: 'numeric',
    minute: '2-digit',
  })
}
