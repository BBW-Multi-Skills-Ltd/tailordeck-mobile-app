import type { Dispatch, SetStateAction } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { clearPreviewSession } from '../../lib/auth'
import type { TailorSettings } from '../../lib/settings'
import { updateLoginEmail, updateLoginPassword } from '../../services/authService'
import { updateProfile } from '../../services/profileService'
import { getServiceErrorMessage } from '../../services/serviceHelpers'
import { useAppFeedback } from '../shared/appFeedbackCore'
import { getSecurityDangerFeedback, getSecurityDangerMessage } from './settingsSecurityActions'

type UseSettingsAccountActionsArgs = {
  confirmPasswordDraft: string
  markSaved: (sectionLabel: string, nextSettings?: TailorSettings) => Promise<void>
  navigate: NavigateFunction
  passwordDraft: string
  setSecurityFeedback: Dispatch<SetStateAction<string>>
  setSignOutConfirmOpen: Dispatch<SetStateAction<boolean>>
  settings: TailorSettings
  signOut: () => Promise<void>
}

export function useSettingsAccountActions({
  confirmPasswordDraft,
  markSaved,
  navigate,
  passwordDraft,
  setSecurityFeedback,
  setSignOutConfirmOpen,
  settings,
  signOut,
}: UseSettingsAccountActionsArgs) {
  const feedback = useAppFeedback()

  async function clearJobHistory(): Promise<boolean> {
    const confirmed = await feedback.confirm({
      title: 'Clear job history?',
      message: 'This removes locally stored job history from this device.',
      confirmLabel: 'Clear history',
      tone: 'danger',
    })
    if (!confirmed) return false
    window.localStorage.removeItem('tailordeck-job-history')
    window.localStorage.removeItem('tailordeck-jobs')
    return true
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

  async function handleSaveLoginDetails(): Promise<void> {
    try {
      await updateLoginEmail(settings.profile.email)
      await markSaved('Account & Security')
      setSecurityFeedback('')
    } catch (error) {
      feedback.toast(getServiceErrorMessage(error, 'Unable to save account details.'), 'error')
      throw error
    }
  }

  async function handleUpdatePassword(): Promise<void> {
    try {
      await updateLoginPassword({ password: passwordDraft, confirmPassword: confirmPasswordDraft })
      setSecurityFeedback('')
    } catch (error) {
      feedback.toast(getServiceErrorMessage(error, 'Unable to update password.'), 'error')
      throw error
    }
  }

  async function handleSecurityDanger(kind: 'deactivate' | 'delete'): Promise<void> {
    const confirmed = await feedback.confirm({
      title: kind === 'delete' ? 'Delete account?' : 'Deactivate account?',
      message: getSecurityDangerMessage(kind),
      confirmLabel: kind === 'delete' ? 'Delete account' : 'Deactivate',
      tone: 'danger',
    })
    if (!confirmed) return

    try {
      await updateProfile(
        kind === 'delete'
          ? { account_status: 'deleted', deleted_at: new Date().toISOString() }
          : { account_status: 'deactivated' },
      )
      setSecurityFeedback(getSecurityDangerFeedback(kind))
    } catch (error) {
      feedback.toast(getServiceErrorMessage(error, 'Unable to update account status.'), 'error')
    }
  }

  return {
    clearJobHistory,
    confirmSignOut,
    handleSaveLoginDetails,
    handleSecurityDanger,
    handleSignOut,
    handleUpdatePassword,
  }
}
