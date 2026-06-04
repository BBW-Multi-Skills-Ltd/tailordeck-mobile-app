export function getSecurityDangerMessage(kind: 'deactivate' | 'delete'): string {
  return kind === 'deactivate'
    ? 'Deactivate account?\nYou can reactivate later once backend auth is connected.'
    : 'Delete account permanently?\nThis is irreversible once backend auth is connected.'
}

export function getSecurityDangerFeedback(kind: 'deactivate' | 'delete'): string {
  return kind === 'deactivate' ? 'Account deactivation queued.' : 'Permanent account delete queued.'
}

export function getSecurityDangerAlert(kind: 'deactivate' | 'delete'): string {
  return `${kind === 'deactivate' ? 'Account deactivation' : 'Permanent account delete'} queued as placeholder. Supabase auth wiring will handle this fully.`
}
