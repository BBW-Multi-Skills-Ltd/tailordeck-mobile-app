import type { TailorSettings } from '../../../lib/settings'

export type AccountDangerAction = 'deactivate' | 'delete'

export type AccountSecurityPanelProps = {
  settings: TailorSettings
  profilePhoneLocalPart: string
  passwordDraft: string
  confirmPasswordDraft: string
  onFullNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onSave: () => void | Promise<void>
  onDanger: (kind: AccountDangerAction) => void
}

export type AccountDetailsDraft = {
  fullName: string
  email: string
  phone: string
}
