import { useState } from 'react'
import type { AccountDetailsDraft } from './accountSecurityTypes'

type UseAccountSecurityStateArgs = {
  currentDetails: AccountDetailsDraft
  confirmPasswordDraft: string
  onConfirmPasswordChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSaveDetails: () => void | Promise<void>
  onUpdatePassword: () => void | Promise<void>
  passwordDraft: string
}

export function useAccountSecurityState({
  confirmPasswordDraft,
  currentDetails,
  onConfirmPasswordChange,
  onPasswordChange,
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
  const [savedDetails, setSavedDetails] = useState(currentDetails)
  const [isEditingDetails, setIsEditingDetails] = useState(false)

  const detailsDirty =
    currentDetails.fullName !== savedDetails.fullName ||
    currentDetails.email !== savedDetails.email ||
    currentDetails.phone !== savedDetails.phone
  const passwordDirty = passwordDraft.trim().length > 0 || confirmPasswordDraft.trim().length > 0

  async function handleDetailsAction() {
    if (!isEditingDetails) {
      setSavedDetails(currentDetails)
      setIsEditingDetails(true)
      return
    }

    if (!detailsDirty) {
      setIsEditingDetails(false)
      return
    }

    await onSaveDetails()
    setSavedDetails(currentDetails)
    setIsEditingDetails(false)
    setDetailsSavedFlash(true)
    window.setTimeout(() => setDetailsSavedFlash(false), 1200)
  }

  async function handlePasswordUpdate() {
    if (!passwordDirty || passwordSaving || passwordSavedFlash) return

    setPasswordSaving(true)
    try {
      await onUpdatePassword()
      setPasswordSavedFlash(true)
      window.setTimeout(() => {
        setPasswordSavedFlash(false)
        setShowPasswordForm(false)
        onPasswordChange('')
        onConfirmPasswordChange('')
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
      setShowConfirmPassword,
      setShowNewPassword,
      setShowPasswordForm,
    },
    state: {
      detailsSavedFlash,
      isEditingDetails,
      passwordDirty,
      passwordSavedFlash,
      passwordSaving,
      showConfirmPassword,
      showNewPassword,
      showPasswordForm,
    },
  }
}
