import type { Dispatch, SetStateAction } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { clearPreviewSession } from '../../lib/auth'
import type { TailorSettings } from '../../lib/settings'
import { useAppFeedback } from '../shared/appFeedbackCore'
import { getSecurityDangerAlert, getSecurityDangerFeedback, getSecurityDangerMessage } from './settingsSecurityActions'

type UseSettingsAccountActionsArgs = {
  markSaved: (sectionLabel: string, nextSettings?: TailorSettings) => Promise<void>
  navigate: NavigateFunction
  setSecurityFeedback: Dispatch<SetStateAction<string>>
  setSignOutConfirmOpen: Dispatch<SetStateAction<boolean>>
  signOut: () => Promise<void>
}

export function useSettingsAccountActions({
  markSaved,
  navigate,
  setSecurityFeedback,
  setSignOutConfirmOpen,
  signOut,
}: UseSettingsAccountActionsArgs) {
  const feedback = useAppFeedback()

  async function clearJobHistory(): Promise<void> {
    const confirmed = await feedback.confirm({
      title: 'Clear job history?',
      message: 'This removes locally stored job history from this device.',
      confirmLabel: 'Clear history',
      tone: 'danger',
    })
    if (!confirmed) return
    window.localStorage.removeItem('tailordeck-job-history')
    window.localStorage.removeItem('tailordeck-jobs')
    feedback.toast('Job history cleared.', 'success')
  }

  async function handleSignOut(): Promise<void> {
    setSignOutConfirmOpen(true)
  }

  async function confirmSignOut(): Promise<void> {
    clearPreviewSession()
    setSignOutConfirmOpen(false)
    await signOut()
    navigate('/auth/signin')
  }

  async function handleSaveAccountSecurity(): Promise<void> {
    await markSaved('Account & Security')
    setSecurityFeedback('Account details saved. Login email/password changes will be handled through Supabase Auth flows.')
  }

  async function handleSecurityDanger(kind: 'deactivate' | 'delete'): Promise<void> {
    const confirmed = await feedback.confirm({
      title: kind === 'delete' ? 'Delete account?' : 'Deactivate account?',
      message: getSecurityDangerMessage(kind),
      confirmLabel: kind === 'delete' ? 'Delete account' : 'Deactivate',
      tone: 'danger',
    })
    if (!confirmed) return

    setSecurityFeedback(getSecurityDangerFeedback(kind))
    feedback.toast(getSecurityDangerAlert(kind), 'info')
  }

  return {
    clearJobHistory,
    confirmSignOut,
    handleSaveAccountSecurity,
    handleSecurityDanger,
    handleSignOut,
  }
}
