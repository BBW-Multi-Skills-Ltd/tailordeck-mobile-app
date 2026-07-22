import type { Dispatch, SetStateAction } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { clearPreviewSession } from '../../lib/auth'
import type { TailorSettings } from '../../lib/settings'
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
  function clearJobHistory(): void {
    if (!window.confirm('Clear all job history data? This action cannot be undone once backend is connected.')) return
    window.localStorage.removeItem('tailordeck-job-history')
    window.localStorage.removeItem('tailordeck-jobs')
    window.alert('Job history cleared locally.')
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

  function handleSecurityDanger(kind: 'deactivate' | 'delete'): void {
    if (!window.confirm(getSecurityDangerMessage(kind))) return

    setSecurityFeedback(getSecurityDangerFeedback(kind))
    window.alert(getSecurityDangerAlert(kind))
  }

  return {
    clearJobHistory,
    confirmSignOut,
    handleSaveAccountSecurity,
    handleSecurityDanger,
    handleSignOut,
  }
}
