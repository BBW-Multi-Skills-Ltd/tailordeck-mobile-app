import type { NewJobWizardStateModel } from './useNewJobWizardState'

// Keeps an unfinished New Job on the phone so it survives Back, a phone call, or Android closing the app
// (e.g. while the camera is open). Photo files are not stored (too large); they must be added again.

const STORAGE_KEY = 'tailordeck-new-job-autosave'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

// Typed-in fields only. Errors, loading flags and photo files are deliberately left out.
const AUTOSAVED_FIELDS = [
  'amendmentArea',
  'amendmentDescription',
  'amendmentIssueType',
  'amendmentNeedsMaterials',
  'amendmentPartName',
  'amendmentPartQuantity',
  'amendmentTarget',
  'chargeAmount',
  'clientName',
  'clientPhone',
  'customMaterialType',
  'customReminderUnit',
  'customReminderValue',
  'deadlineDate',
  'deadlineTime',
  'depositPercent',
  'expenseDraftCost',
  'expenseDraftName',
  'expenses',
  'itemType',
  'jobType',
  'makeCategory',
  'materialColor',
  'materialQuality',
  'materialSource',
  'materialType',
  'materialYards',
  'nonBodyDescription',
  'nonBodyMeasurements',
  'nonBodyQuantity',
  'orderMode',
  'pendingClientId',
  'pendingJobId',
  'persons',
  'reminder',
  'sameItemForAll',
  'step',
  'worthIt',
] as const

type AutosavedField = (typeof AUTOSAVED_FIELDS)[number]
type AutosavedValues = Partial<Record<AutosavedField, unknown>>
type StoredAutosave = { userId: string; savedAt: number; values: AutosavedValues }

export function hasMeaningfulNewJobInput(state: NewJobWizardStateModel): boolean {
  return Boolean(state.clientName.trim() || state.clientPhone.trim() || state.step > 0)
}

export function saveNewJobAutosave(userId: string, state: NewJobWizardStateModel): void {
  const values: AutosavedValues = {}
  for (const field of AUTOSAVED_FIELDS) values[field] = state[field]
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, savedAt: Date.now(), values } satisfies StoredAutosave))
  } catch {
    // Storage full or blocked: autosave is a convenience, never block the wizard.
  }
}

export function readNewJobAutosave(userId: string): StoredAutosave | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as StoredAutosave
    if (stored.userId !== userId || Date.now() - stored.savedAt > MAX_AGE_MS || !stored.values) {
      clearNewJobAutosave()
      return null
    }
    return stored
  } catch {
    clearNewJobAutosave()
    return null
  }
}

export function restoreNewJobAutosave(state: NewJobWizardStateModel, stored: StoredAutosave): void {
  const setters = state as unknown as Record<string, unknown>
  for (const field of AUTOSAVED_FIELDS) {
    if (!(field in stored.values)) continue
    const setter = setters[`set${field[0].toUpperCase()}${field.slice(1)}`]
    if (typeof setter === 'function') setter(stored.values[field])
  }
  state.setStepFourReviewMode(false)
}

export function clearNewJobAutosave(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
