import type { TailorSettings } from '../../../lib/settings'

export type AccountDangerAction = 'deactivate' | 'delete'

export type AccountSecurityPanelProps = {
  settings: TailorSettings
  profilePhoneLocalPart: string
  passwordDraft: string
  confirmPasswordDraft: string
  securityFeedback?: string
  onFullNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onSaveDetails: (securityCode?: string) => { emailChangePending: boolean; pendingEmail?: string } | Promise<{ emailChangePending: boolean; pendingEmail?: string }>
  onConfirmEmailChange: (email: string, token: string) => void | Promise<void>
  onRequestPasswordCode: () => void | Promise<void>
  onUpdatePassword: (securityCode?: string) => void | Promise<void>
  onDanger: (kind: AccountDangerAction) => void
}

export type AccountDetailsDraft = {
  fullName: string
  email: string
  phone: string
}
