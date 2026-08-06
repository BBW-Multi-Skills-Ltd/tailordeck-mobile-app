import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { RotateCcw, ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/authContextCore'
import { useProfileQuery, useRestoreAccountMutation } from '../hooks/useProfileQueries'
import { getServiceErrorMessage } from '../services/serviceHelpers'

function daysUntil(value: string | null | undefined): number | null {
  if (!value) return null
  const diff = new Date(value).getTime() - Date.now()
  if (Number.isNaN(diff)) return null
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function AccountStatus() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [restoreError, setRestoreError] = useState('')
  const profileQuery = useProfileQuery(Boolean(auth.session))
  const restoreMutation = useRestoreAccountMutation()
  const profile = profileQuery.data
  const status = profile?.account_status
  const daysLeft = useMemo(() => daysUntil(profile?.deletion_scheduled_at), [profile?.deletion_scheduled_at])

  if (!auth.session) return <Navigate to="/auth/signin" replace />
  if (profileQuery.isLoading) {
    return (
      <main className="page-full route-guard-loading">
        <img src="/branding/TailorDeck%20app%20logo%20for%20splac%20screen.png" alt="TailorDeck" />
        <p>Checking account status...</p>
      </main>
    )
  }
  if (status !== 'deactivated' && status !== 'pending_deletion') return <Navigate to="/" replace />

  async function handleRestore(): Promise<void> {
    try {
      setRestoreError('')
      await restoreMutation.mutateAsync()
      navigate('/', { replace: true })
    } catch (error) {
      setRestoreError(getServiceErrorMessage(error, 'Unable to restore account.'))
    }
  }

  async function handleSignOut(): Promise<void> {
    await auth.signOut()
    navigate('/auth/signin', { replace: true })
  }

  const isPendingDeletion = status === 'pending_deletion'
  const title = isPendingDeletion ? 'Account Pending Deletion' : 'Account Deactivated'
  const copy = isPendingDeletion
    ? `Your TailorDeck account is locked and scheduled for deletion${daysLeft === null ? '.' : ` in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`}`
    : 'Your TailorDeck account is paused. Restore it to continue managing your shop.'

  return (
    <main className="account-status-page">
      <section className="account-status-card clay-card">
        <span className="account-status-icon">
          <ShieldAlert size={24} />
        </span>
        <p className="account-status-kicker">{isPendingDeletion ? '14-day grace period' : 'Paused account'}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
        {isPendingDeletion ? (
          <p>
            Restoring now keeps your shop, clients, jobs, measurements, documents, photos, logo, signature, and settings accessible.
          </p>
        ) : null}
        {restoreError ? <p className="inline-feedback-error" role="alert">{restoreError}</p> : null}
        <div className="account-status-actions">
          <button type="button" className="btn btn-primary btn-full" disabled={restoreMutation.isPending} onClick={() => void handleRestore()}>
            <RotateCcw size={16} />
            {restoreMutation.isPending ? 'Restoring...' : 'Restore Account'}
          </button>
          <button type="button" className="btn btn-secondary btn-full" onClick={() => void handleSignOut()}>
            Sign Out
          </button>
        </div>
      </section>
    </main>
  )
}
