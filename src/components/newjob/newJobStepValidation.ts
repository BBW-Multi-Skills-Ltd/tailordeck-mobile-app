import { z } from 'zod'
import {
  newJobClientStepSchema,
  newJobCostingStepSchema,
  newJobDeadlineStepSchema,
  newJobMaterialStepSchema,
  newJobPersonSchema,
} from '../../validation/jobSchemas'
import { buildNewJobPayload } from './newJobSupabasePayload'
import type { NewJobWizardDerivedModel } from './newJobWizardDerived'
import type { NewJobWizardStateModel } from './useNewJobWizardState'

function validationMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || 'Please review this step before continuing.'
  }
  return error instanceof Error ? error.message : 'Please review this step before continuing.'
}

function validatePersonsForStep(payload: ReturnType<typeof buildNewJobPayload>): void {
  z.array(newJobPersonSchema).min(1, 'Add at least one person or item measurement.').parse(payload.persons)
}

export function validateNewJobStep(params: {
  derived: NewJobWizardDerivedModel
  repeatClientId?: string | null
  state: NewJobWizardStateModel
  step: number
}): { ok: true } | { ok: false; message: string } {
  const { derived, repeatClientId, state, step } = params

  try {
    const payload = buildNewJobPayload({ derived, repeatClientId, state })

    if (step === 0) {
      newJobClientStepSchema.parse(payload)
      validatePersonsForStep(payload)
    }

    if (step === 1) {
      newJobMaterialStepSchema.parse(payload)
    }

    if (step === 2) {
      newJobCostingStepSchema.parse(payload)
    }

    if (step === 3) {
      newJobDeadlineStepSchema.parse(payload)
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, message: validationMessage(error) }
  }
}
