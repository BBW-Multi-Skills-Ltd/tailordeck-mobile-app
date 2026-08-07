import { useState } from 'react'
import { passwordChecks, passwordStrength } from '../../../lib/formValidation'
import type { AccountDetailsDraft } from './accountSecurityTypes'

type PasswordConfirmState = 'idle' | 'partial' | 'match' | 'mismatch'

type UseAccountSecurityStateArgs = {
  currentDetails: AccountDetailsDraft
  confirmPasswordDraft: string
  onConfirmPasswordChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onRequestDetailsCode: () => void | Promise<void>
  onRequestPasswordCode: () => void | Promise<void>
  onSaveDetails: (securityCode?: string) => void | Promise<void>
  onUpdatePassword: (securityCode?: string) => void | Promise<void>
  passwordDraft: string
}

export function useAccountSecurityState({
  confirmPasswordDraft,
  currentDetails,
  onConfirmPasswordChange,
  onPasswordChange,
  onRequestDetailsCode,
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
  const [detailsCode, setDetailsCode] = useState('')
  const [detailsCodeRequested, setDetailsCodeRequested] = useState(false)
  const [detailsCodeFeedback, setDetailsCodeFeedback] = useState('')
  const [detailsCodeRequesting, setDetailsCodeRequesting] = useState(false)
  const [detailsSaving, setDetailsSaving] = useState(false)
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
      setDetailsCode('')
      setDetailsCodeFeedback('')
      setDetailsCodeRequested(false)
      setIsEditingDetails(true)
      return
    }

    if (!detailsDirty) {
      setIsEditingDetails(false)
      return
    }

    if (emailChanged && !detailsCodeRequested) {
      await handleRequestDetailsCode()
      return
    }

    if (emailChanged && detailsCode.trim().length < 6) return

    setDetailsSaving(true)
    try {
      await onSaveDetails(emailChanged ? detailsCode : undefined)
      setSavedDetails(currentDetails)
      setIsEditingDetails(false)
      setDetailsCode('')
      setDetailsCodeFeedback('')
      setDetailsCodeRequested(false)
      setDetailsSavedFlash(true)
      window.setTimeout(() => setDetailsSavedFlash(false), 1200)
    } finally {
      setDetailsSaving(false)
    }
  }

  async function handleRequestDetailsCode() {
    if (!emailChanged || detailsCodeRequesting) return

    setDetailsCodeRequesting(true)
    try {
      await onRequestDetailsCode()
      setDetailsCode('')
      setDetailsCodeRequested(true)
      setDetailsCodeFeedback('Security code sent to your current email.')
    } finally {
      setDetailsCodeRequesting(false)
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
      handlePasswordUpdate,
      handleRequestDetailsCode,
      handleRequestPasswordCode,
      setDetailsCode,
      setPasswordCode,
      setShowConfirmPassword,
      setShowNewPassword,
      setShowPasswordForm,
    },
    state: {
      detailsSavedFlash,
      detailsCode,
      detailsCodeFeedback,
      detailsCodeRequested,
      detailsCodeRequesting,
      detailsSaving,
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
