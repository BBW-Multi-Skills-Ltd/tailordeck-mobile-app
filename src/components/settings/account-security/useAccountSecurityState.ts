import { useState } from 'react'
import { passwordChecks, passwordStrength } from '../../../lib/formValidation'
import type { AccountDetailsDraft } from './accountSecurityTypes'

type PasswordConfirmState = 'idle' | 'partial' | 'match' | 'mismatch'

type UseAccountSecurityStateArgs = {
  currentDetails: AccountDetailsDraft
  confirmPasswordDraft: string
  onConfirmPasswordChange: (value: string) => void
  onConfirmEmailChange: (email: string, token: string) => void | Promise<void>
  onPasswordChange: (value: string) => void
  onRequestPasswordCode: () => void | Promise<void>
  onSaveDetails: (securityCode?: string) => { emailChangePending: boolean; pendingEmail?: string } | Promise<{ emailChangePending: boolean; pendingEmail?: string }>
  onUpdatePassword: (securityCode?: string) => void | Promise<void>
  passwordDraft: string
}

export function useAccountSecurityState({
  confirmPasswordDraft,
  currentDetails,
  onConfirmEmailChange,
  onConfirmPasswordChange,
  onPasswordChange,
  onRequestPasswordCode,
  onSaveDetails,
  onUpdatePassword,
  passwordDraft,
}: UseAccountSecurityStateArgs) {
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [detailsSavedFlash, setDetailsSavedFlash] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSavedFlash, setPasswordSavedFlash] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordCode, setPasswordCode] = useState('')
  const [passwordCodeRequested, setPasswordCodeRequested] = useState(false)
  const [passwordCodeFeedback, setPasswordCodeFeedback] = useState('')
  const [passwordCodeRequesting, setPasswordCodeRequesting] = useState(false)
  const [detailsCodeFeedback, setDetailsCodeFeedback] = useState('')
  const [detailsSaving, setDetailsSaving] = useState(false)
  const [emailConfirmCode, setEmailConfirmCode] = useState('')
  const [emailConfirming, setEmailConfirming] = useState(false)
  const [emailChangePendingEmail, setEmailChangePendingEmail] = useState('')
  const [savedDetails, setSavedDetails] = useState(currentDetails)
  const [isEditingDetails, setIsEditingDetails] = useState(false)

  const emailChanged = currentDetails.email.trim().toLowerCase() !== savedDetails.email.trim().toLowerCase()
  const detailsDirty =
    currentDetails.fullName !== savedDetails.fullName ||
    currentDetails.email !== savedDetails.email ||
    currentDetails.phone !== savedDetails.phone
  const passwordDirty = passwordDraft.trim().length > 0 || confirmPasswordDraft.trim().length > 0
  const strength = passwordStrength(passwordDraft)
  const checks = passwordChecks(passwordDraft)
  const passwordReady = strength >= 4 && passwordDraft === confirmPasswordDraft
  const passwordCodeReady = passwordCode.trim().length >= 6
  const confirmState: PasswordConfirmState = !passwordDraft || !confirmPasswordDraft
    ? 'idle'
    : passwordDraft === confirmPasswordDraft
      ? 'match'
      : passwordDraft.startsWith(confirmPasswordDraft)
        ? 'partial'
        : 'mismatch'

  async function handleDetailsAction() {
    if (!isEditingDetails) {
      setSavedDetails(currentDetails)
      setDetailsCodeFeedback('')
      setIsEditingDetails(true)
      return
    }

    if (!detailsDirty) {
      setIsEditingDetails(false)
      return
    }

    setDetailsSaving(true)
    try {
      const result = await onSaveDetails()
      if (result.emailChangePending && result.pendingEmail) {
        setEmailChangePendingEmail(result.pendingEmail)
        setEmailConfirmCode('')
        setDetailsCodeFeedback(`Enter the code sent to ${result.pendingEmail}.`)
        setDetailsSaving(false)
        return
      }
      setSavedDetails(currentDetails)
      setIsEditingDetails(false)
      setDetailsCodeFeedback('')
      setDetailsSavedFlash(true)
      window.setTimeout(() => setDetailsSavedFlash(false), 1200)
    } finally {
      setDetailsSaving(false)
    }
  }

  async function handleConfirmEmailChange() {
    const pendingEmail = emailChangePendingEmail.trim().toLowerCase()
    if (!pendingEmail || emailConfirmCode.trim().length < 6 || emailConfirming) return

    setEmailConfirming(true)
    try {
      setDetailsCodeFeedback('')
      await onConfirmEmailChange(pendingEmail, emailConfirmCode)
      const nextDetails = { ...currentDetails, email: pendingEmail }
      setSavedDetails(nextDetails)
      setEmailChangePendingEmail('')
      setEmailConfirmCode('')
      setDetailsCodeFeedback('')
      setIsEditingDetails(false)
      setDetailsSavedFlash(true)
      window.setTimeout(() => setDetailsSavedFlash(false), 1200)
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'Unable to confirm email change.'
      setDetailsCodeFeedback(message)
    } finally {
      setEmailConfirming(false)
    }
  }

  async function handleRequestPasswordCode() {
    if (!passwordReady || passwordCodeRequesting) return

    setPasswordCodeRequesting(true)
    try {
      await onRequestPasswordCode()
      setPasswordCode('')
      setPasswordCodeRequested(true)
      setPasswordCodeFeedback('Security code sent to your email.')
    } finally {
      setPasswordCodeRequesting(false)
    }
  }

  async function handlePasswordUpdate() {
    if (!passwordDirty || !passwordReady || !passwordCodeRequested || !passwordCodeReady || passwordSaving || passwordSavedFlash) return

    setPasswordSaving(true)
    try {
      await onUpdatePassword(passwordCode)
      setPasswordSavedFlash(true)
      window.setTimeout(() => {
        setPasswordSavedFlash(false)
        setShowPasswordForm(false)
        onPasswordChange('')
        onConfirmPasswordChange('')
        setPasswordCode('')
        setPasswordCodeFeedback('')
        setPasswordCodeRequested(false)
        setShowNewPassword(false)
        setShowConfirmPassword(false)
      }, 1100)
    } finally {
      setPasswordSaving(false)
    }
  }

  return {
    actions: {
      handleDetailsAction,
      handleConfirmEmailChange,
      handlePasswordUpdate,
      handleRequestPasswordCode,
      setEmailConfirmCode,
      setPasswordCode,
      setShowConfirmPassword,
      setShowNewPassword,
      setShowPasswordForm,
    },
    state: {
      detailsSavedFlash,
      detailsCodeFeedback,
      detailsSaving,
      emailConfirmCode,
      emailConfirming,
      emailChangePendingEmail,
      emailChanged,
      isEditingDetails,
      passwordDirty,
      passwordReady,
      passwordCode,
      passwordCodeFeedback,
      passwordCodeReady,
      passwordCodeRequested,
      passwordCodeRequesting,
      passwordStrength: strength,
      passwordChecks: checks,
      passwordConfirmState: confirmState,
      passwordSavedFlash,
      passwordSaving,
      showConfirmPassword,
      showNewPassword,
      showPasswordForm,
    },
  }
}
