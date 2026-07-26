export function getSecurityDangerMessage(kind: 'deactivate' | 'delete'): string {
  return kind === 'deactivate'
    ? 'Deactivate account?\nYour account will be marked inactive.'
    : 'Delete account permanently?\nThis action marks your account for removal.'
}

export function getSecurityDangerFeedback(kind: 'deactivate' | 'delete'): string {
  return kind === 'deactivate' ? 'Account deactivated.' : 'Account marked for deletion.'
}

export function getSecurityDangerAlert(kind: 'deactivate' | 'delete'): string {
  return kind === 'deactivate' ? 'Account deactivated.' : 'Account marked for deletion.'
}
