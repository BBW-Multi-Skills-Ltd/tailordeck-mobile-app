import { describe, expect, it, vi } from 'vitest'
import { buildNewJobPayload } from '../newJobSupabasePayload'
import type { NewJobWizardDerivedModel } from '../newJobWizardDerived'
import type { NewJobWizardStateModel } from '../useNewJobWizardState'

function makeState(overrides: Partial<NewJobWizardStateModel> = {}): NewJobWizardStateModel {
  return {
    amendmentArea: '',
    amendmentDescription: '',
    amendmentIssueType: '',
    amendmentNeedsMaterials: false,
    amendmentPartName: '',
    amendmentPartQuantity: '',
    amendmentTarget: '',
    chargeAmount: '150000',
    clientName: 'Amina Bello',
    clientPhone: '08012345678',
    createdJobId: '',
    customMaterialType: '',
    deadlineDate: '2026-08-10',
    deadlineTime: '14:30',
    depositPercent: '40',
    draftSaved: false,
    expenseDraftCost: '',
    expenseDraftName: '',
    expenses: [{ id: 'expense-1', name: 'Thread', cost: '2500' }],
    fieldErrors: {},
    isFinalizing: false,
    itemType: 'Agbada',
    jobType: 'Single',
    makeCategory: 'Body Wear',
    materialColor: 'Blue',
    materialQuality: 'Original',
    materialSource: 'Client is Providing Material',
    materialType: 'Ankara',
    materialYards: '6',
    nonBodyDescription: '',
    nonBodyMeasurements: {},
    nonBodyQuantity: '1',
    openMaterialCategory: 'local',
    orderMode: 'New Stitch',
    persons: [
      {
        age: '',
        description: 'Loose fit',
        id: 'person-1',
        itemType: 'Agbada',
        measurements: { chest: '42', waist: '38', note: 'comfort fit' },
        name: '',
        role: 'adult',
        sex: 'Male',
      },
    ],
    referencePhotoFiles: [],
    referencePhotoFilesByTarget: {},
    referencePhotoNames: [],
    referencePhotoNamesByTarget: {},
    reminder: '3 days before',
    sameItemForAll: true,
    setAmendmentArea: vi.fn(),
    setAmendmentDescription: vi.fn(),
    setAmendmentIssueType: vi.fn(),
    setAmendmentNeedsMaterials: vi.fn(),
    setAmendmentPartName: vi.fn(),
    setAmendmentPartQuantity: vi.fn(),
    setAmendmentTarget: vi.fn(),
    setChargeAmount: vi.fn(),
    setClientName: vi.fn(),
    setClientPhone: vi.fn(),
    setCreatedJobId: vi.fn(),
    setCustomMaterialType: vi.fn(),
    setDeadlineDate: vi.fn(),
    setDeadlineTime: vi.fn(),
    setDepositPercent: vi.fn(),
    setDraftSaved: vi.fn(),
    setExpenseDraftCost: vi.fn(),
    setExpenseDraftName: vi.fn(),
    setExpenses: vi.fn(),
    setFieldErrors: vi.fn(),
    setIsFinalizing: vi.fn(),
    setItemType: vi.fn(),
    setJobType: vi.fn(),
    setMakeCategory: vi.fn(),
    setMaterialColor: vi.fn(),
    setMaterialQuality: vi.fn(),
    setMaterialSource: vi.fn(),
    setMaterialType: vi.fn(),
    setMaterialYards: vi.fn(),
    setNonBodyDescription: vi.fn(),
    setNonBodyMeasurements: vi.fn(),
    setNonBodyQuantity: vi.fn(),
    setOpenMaterialCategory: vi.fn(),
    setOrderMode: vi.fn(),
    setPersons: vi.fn(),
    setReferencePhotoFiles: vi.fn(),
    setReferencePhotoFilesByTarget: vi.fn(),
    setReferencePhotoNames: vi.fn(),
    setReferencePhotoNamesByTarget: vi.fn(),
    setReminder: vi.fn(),
    setSameItemForAll: vi.fn(),
    setSingleMeasurementsOpen: vi.fn(),
    setStep: vi.fn(),
    setStepFourDetailsOpen: vi.fn(),
    setStepFourReviewMode: vi.fn(),
    setStepOneMeasurementsOpen: vi.fn(),
    setSuccessOpen: vi.fn(),
    setWorthIt: vi.fn(),
    singleMeasurementsOpen: true,
    step: 0,
    stepFourDetailsOpen: true,
    stepFourReviewMode: false,
    stepOneMeasurementsOpen: {},
    successOpen: false,
    worthIt: 'Yes',
    ...overrides,
  }
}

function makeDerived(overrides: Partial<NewJobWizardDerivedModel> = {}): NewJobWizardDerivedModel {
  return {
    balance: 90000,
    charge: 150000,
    deposit: 60000,
    depositPercentValue: 40,
    effectiveItemType: 'Agbada',
    isAmendmentMode: false,
    projectedProfit: 147500,
    scopeLabel: 'Single',
    selectedMaterialValue: 'Ankara',
    selectedNonBodyFields: [],
    showAmendmentMaterialFlow: false,
    showBodyMeasurementFlow: true,
    showFullMaterialFlow: true,
    showNonBodyMeasurementFlow: false,
    totalExpenses: 2500,
    ...overrides,
  }
}

describe('buildNewJobPayload', () => {
  it('maps a body-wear job into the Supabase create payload', () => {
    const payload = buildNewJobPayload({ state: makeState(), derived: makeDerived() })

    expect(payload.clientName).toBe('Amina Bello')
    expect(payload.clientPhone).toBe('08012345678')
    expect(payload.clientSex).toBe('Male')
    expect(payload.title).toBe('Agbada')
    expect(payload.orderScope).toBe('Single')
    expect(payload.chargeAmount).toBe(150000)
    expect(payload.depositPercent).toBe(40)
    expect(payload.materialYards).toBe(6)
    expect(payload.expenses).toEqual([{ name: 'Thread', cost: 2500 }])
    expect(payload.persons[0]).toMatchObject({
      name: 'Amina Bello',
      measurementKind: 'body',
      measurementUnit: 'inches',
      measurements: { chest: 42, waist: 38, note: 'comfort fit' },
    })
  })

  it('maps a non-body job with quantity and description', () => {
    const payload = buildNewJobPayload({
      state: makeState({
        itemType: 'Curtain',
        makeCategory: 'Non-Body Item',
        nonBodyDescription: 'Living room curtain',
        nonBodyMeasurements: { width: '60', length: '84' },
        nonBodyQuantity: '4',
        persons: [],
      }),
      derived: makeDerived({ effectiveItemType: 'Curtain', selectedMaterialValue: 'Velvet' }),
    })

    expect(payload.orderScope).toBe('Single')
    expect(payload.description).toBe('Living room curtain')
    expect(payload.persons).toHaveLength(1)
    expect(payload.persons[0]).toMatchObject({
      measurementKind: 'non_body',
      quantity: '4',
      measurements: { width: 60, length: 84 },
    })
  })
})
