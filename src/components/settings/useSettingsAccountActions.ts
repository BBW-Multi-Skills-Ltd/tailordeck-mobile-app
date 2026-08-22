import type { Dispatch, SetStateAction } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { clearPreviewSession } from '../../lib/auth'
import type { TailorSettings } from '../../lib/settings'
import { useDeactivateAccountMutation, useRequestAccountDeletionMutation } from '../../hooks/useProfileQueries'
import { requestPasswordSecurityCode, updateLoginEmail, updateLoginPassword, verifyLoginEmailChangeOtp } from '../../services/authService'
import { supabase } from '../../lib/supabase'
import { syncProfileEmailFromAuth } from '../../services/profileService'
import { softDeleteAllJobs } from '../../services/jobService'
import { getServiceErrorMessage } from '../../services/serviceHelpers'
import { useAppFeedback } from '../shared/appFeedbackCore'
import { getSecurityDangerMessage } from './settingsSecurityActions'

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
  const deactivateAccountMutation = useDeactivateAccountMutation()
  const requestDeletionMutation = useRequestAccountDeletionMutation()

  async function clearJobHistory(): Promise<boolean> {
    const confirmed = await feedback.confirm({
      title: 'Clear job history?',
      message: 'This hides all current jobs from your TailorDeck account. Clients and settings stay safe.',
      confirmLabel: 'Clear history',
      tone: 'danger',
    })
    if (!confirmed) return false
    await softDeleteAllJobs()
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

  async function handleSaveLoginDetails(securityCode?: string): Promise<{ emailChangePending: boolean; pendingEmail?: string }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      const currentAuthEmail = authData.user?.email?.trim().toLowerCase() || settings.profile.email
      const nextEmail = settings.profile.email.trim().toLowerCase()
      const emailChanged = nextEmail !== currentAuthEmail

      const emailChangePending = await updateLoginEmail({
        email: settings.profile.email,
        nonce: securityCode?.trim() || undefined,
      })

      await markSaved('Account & Security', {
        ...settings,
        profile: {
          ...settings.profile,
          email: emailChangePending ? currentAuthEmail : settings.profile.email,
        },
      })
      setSecurityFeedback('')
      return { emailChangePending, pendingEmail: emailChanged ? nextEmail : undefined }
    } catch (error) {
      setSecurityFeedback(getServiceErrorMessage(error, 'Unable to save account details.'))
      throw error
    }
  }

  async function handleConfirmEmailChange(email: string, token: string): Promise<void> {
    try {
      await verifyLoginEmailChangeOtp({ email, token })
      await syncProfileEmailFromAuth()
      await markSaved('Account & Security', {
        ...settings,
        profile: {
          ...settings.profile,
          email: email.trim().toLowerCase(),
        },
      })
      setSecurityFeedback('')
    } catch (error) {
      setSecurityFeedback(getServiceErrorMessage(error, 'Unable to confirm email change.'))
      throw error
    }
  }

  async function handleRequestPasswordCode(): Promise<void> {
    try {
      await requestPasswordSecurityCode()
      setSecurityFeedback('')
    } catch (error) {
      setSecurityFeedback(getServiceErrorMessage(error, 'Unable to send security code.'))
      throw error
    }
  }

  async function handleUpdatePasswordWithCode(securityCode?: string): Promise<void> {
    try {
      await updateLoginPassword({
        password: passwordDraft,
        confirmPassword: confirmPasswordDraft,
        nonce: securityCode?.trim() || undefined,
      })
      setSecurityFeedback('')
    } catch (error) {
      setSecurityFeedback(getServiceErrorMessage(error, 'Unable to update password.'))
      throw error
    }
  }

  async function handleSecurityDanger(kind: 'deactivate' | 'delete'): Promise<void> {
    const requiredText = kind === 'delete' ? 'DELETE' : 'DEACTIVATE'
    const confirmed = await feedback.confirm({
      title: kind === 'delete' ? 'Delete account?' : 'Deactivate account?',
      message: getSecurityDangerMessage(kind),
      confirmLabel: kind === 'delete' ? 'Request deletion' : 'Deactivate',
      requiredText,
      requiredTextLabel: 'Type',
      tone: 'danger',
    })
    if (!confirmed) return

    try {
      window.sessionStorage.setItem('tailordeck-account-action-signing-out', 'true')
      if (kind === 'delete') {
        await requestDeletionMutation.mutateAsync(undefined)
      } else {
        await deactivateAccountMutation.mutateAsync(undefined)
      }
      clearPreviewSession()
      setSecurityFeedback('')
      await signOut()
      window.sessionStorage.removeItem('tailordeck-account-action-signing-out')
      navigate('/auth/signin', { replace: true })
    } catch (error) {
      window.sessionStorage.removeItem('tailordeck-account-action-signing-out')
      setSecurityFeedback(getServiceErrorMessage(error, 'Unable to update account status.'))
    }
  }

  return {
    clearJobHistory,
    confirmSignOut,
    handleSaveLoginDetails,
    handleSecurityDanger,
    handleSignOut,
    handleRequestPasswordCode,
    handleConfirmEmailChange,
    handleUpdatePasswordWithCode,
  }
}
