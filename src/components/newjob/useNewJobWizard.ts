import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useClientQuery } from '../../hooks/useClientQueries'
import { useJobQuery } from '../../hooks/useJobQueries'
import { useSettingsQuery } from '../../hooks/useSettingsQueries'
import { scrollFirstFormErrorIntoView } from '../../lib/scroll'
import { useAuth } from '../../context/authContextCore'
import { useAppFeedback } from '../shared/appFeedbackCore'
import { clearNewJobAutosave, hasMeaningfulNewJobInput, readNewJobAutosave, restoreNewJobAutosave, saveNewJobAutosave } from './newJobAutosave'
import { hasNewJobErrors, type NewJobFieldKey, validateNewJobFields } from './newJobFieldValidation'
import { createFieldAwareNewJobActions } from './newJobFieldAwareActions'
import { createNewJobWizardActions } from './newJobWizardActions'
import { applyDraftToNewJobState } from './newJobDraftMapper'
import { getNewJobWizardDerived } from './newJobWizardDerived'
import { getNewJobWizardStateSnapshot } from './newJobWizardStateSnapshot'
import { validateNewJobStep } from './newJobStepValidation'
import { usePageNoScroll, useSharedItemTypeSync } from './useNewJobEffects'
import { useNewJobPersistence } from './useNewJobPersistence'
import { useRepeatClientPrefill } from './useRepeatClientPrefill'
import { useNewJobWizardState } from './useNewJobWizardState'

export function useNewJobWizard() {
  const navigate = useNavigate()
  const feedback = useAppFeedback()
  const userId = useAuth().user?.id ?? ''
  const [searchParams] = useSearchParams()
  const sectionRef = useRef<HTMLElement | null>(null)
  const appliedDraftIdRef = useRef('')
  const state = useNewJobWizardState()
  const settingsQuery = useSettingsQuery()
  const repeatClientId = searchParams.get('clientId')
  const draftId = searchParams.get('draftId')
  const repeatClientQuery = useClientQuery(repeatClientId ?? undefined)
  const draftQuery = useJobQuery(draftId ?? undefined)
  const derived = getNewJobWizardDerived(state)
  const repeatClient = repeatClientQuery.data ?? undefined
  const { handleFinalizeJob, handleSaveDraft } = useNewJobPersistence({ derived, draftId, repeatClientId, state })

  function clearFieldError(field: NewJobFieldKey): void {
    state.setWizardError('')
    state.setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function validateCurrentStep(): boolean {
    state.setWizardError('')
    const fieldErrors = validateNewJobFields({ derived, state, step: state.step })
    state.setFieldErrors(fieldErrors)
    if (hasNewJobErrors(fieldErrors)) {
      state.setFieldErrorKey((current) => current + 1)
      scrollFirstFormErrorIntoView('.wizard-page')
      return false
    }

    const result = validateNewJobStep({ derived, repeatClientId, state, step: state.step })
    if (result.ok) return true
    state.setFieldErrorKey((current) => current + 1)
    scrollFirstFormErrorIntoView('.wizard-page')
    state.setWizardError(result.message)
    return false
  }

  useRepeatClientPrefill(repeatClient, {
    setClientName: state.setClientName,
    setClientPhone: state.setClientPhone,
    setOrderMode: state.setOrderMode,
    setMakeCategory: state.setMakeCategory,
    setJobType: state.setJobType,
    setItemType: state.setItemType,
    setSameItemForAll: state.setSameItemForAll,
    setPersons: state.setPersons,
    setNonBodyMeasurements: state.setNonBodyMeasurements,
    setNonBodyQuantity: state.setNonBodyQuantity,
    setNonBodyDescription: state.setNonBodyDescription,
    setSingleMeasurementsOpen: state.setSingleMeasurementsOpen,
    setStepOneMeasurementsOpen: state.setStepOneMeasurementsOpen,
  })
  usePageNoScroll(state.successOpen)
  useSharedItemTypeSync({ makeCategory: state.makeCategory, sameItemForAll: state.sameItemForAll, itemType: state.itemType, setPersons: state.setPersons })

  useEffect(() => {
    if (!draftQuery.data || draftQuery.data.status !== 'draft' || appliedDraftIdRef.current === draftQuery.data.id) return
    applyDraftToNewJobState(draftQuery.data, state)
    appliedDraftIdRef.current = draftQuery.data.id
  }, [draftQuery.data, state])

  // Offer to continue an unfinished job (left via Back, a call, or Android closing the app).
  const autosaveCheckedRef = useRef(false)
  useEffect(() => {
    if (autosaveCheckedRef.current || !userId || draftId || repeatClientId) return
    autosaveCheckedRef.current = true
    const stored = readNewJobAutosave(userId)
    if (!stored) return
    const savedClient = typeof stored.values.clientName === 'string' && stored.values.clientName.trim() ? ` for ${stored.values.clientName.trim()}` : ''
    void feedback
      .confirm({
        title: 'Continue unfinished job?',
        message: `You have a job in progress${savedClient}. Continue where you stopped? Reference photos need to be added again.`,
        confirmLabel: 'Continue',
        cancelLabel: 'Start new',
      })
      .then((resume) => {
        if (resume) restoreNewJobAutosave(state, stored)
        else clearNewJobAutosave()
      })
  }, [draftId, feedback, repeatClientId, state, userId])

  // Save typed-in progress shortly after each change (new jobs only; drafts are already saved online).
  useEffect(() => {
    if (!userId || draftId || state.successOpen || state.draftSaved || !hasMeaningfulNewJobInput(state)) return
    const timer = window.setTimeout(() => saveNewJobAutosave(userId, state), 600)
    return () => window.clearTimeout(timer)
  }, [draftId, state, userId])

  useEffect(() => {
    if (draftId || state.reminder || !settingsQuery.data) return
    state.setReminder(settingsQuery.data.reminders.defaultReminder)
    state.setCustomReminderValue(settingsQuery.data.reminders.defaultCustomReminderValue)
    state.setCustomReminderUnit(settingsQuery.data.reminders.defaultCustomReminderUnit)
  }, [draftId, settingsQuery.data, state])

  const actions = createNewJobWizardActions({
    confirmDiscard: async () => {
      const confirmed = await feedback.confirm({
        title: 'Discard this job?',
        message: 'This will remove the current job draft and return to Jobs.',
        confirmLabel: 'Discard',
        tone: 'danger',
      })
      if (confirmed) clearNewJobAutosave()
      return confirmed
    },
    navigate,
    state,
    validateCurrentStep,
  })
  const fieldAwareActions = createFieldAwareNewJobActions({ actions, clearFieldError, state })

  return {
    actions: {
      ...fieldAwareActions,
      handleFinalizeJob,
      proceedToReview: () => {
        if (!validateCurrentStep()) return
        state.setStepFourReviewMode(true)
      },
      saveDraft: handleSaveDraft,
      viewCreatedJob: () => navigate(state.createdJobId ? `/jobs/${state.createdJobId}` : '/jobs'),
    },
    derived,
    repeatClient: Boolean(repeatClient),
    sectionRef,
    state: getNewJobWizardStateSnapshot(state),
  }
}

export type NewJobWizardModel = ReturnType<typeof useNewJobWizard>
