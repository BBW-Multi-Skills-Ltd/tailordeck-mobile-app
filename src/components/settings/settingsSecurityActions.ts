export function getSecurityDangerMessage(kind: 'deactivate' | 'delete'): string {
  return kind === 'deactivate'
    ? 'Your account will be paused and you will be signed out. Your shop data stays stored, and you can reactivate by signing in again.'
    : 'Your account will be locked immediately and scheduled for permanent deletion in 14 days. During that time, you can sign in and restore it. After 14 days, your shop, clients, jobs, measurements, documents, photos, logo, signature, and settings may be permanently removed.'
}
