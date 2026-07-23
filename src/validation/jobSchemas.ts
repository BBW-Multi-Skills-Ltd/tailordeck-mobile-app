import { z } from 'zod'

const requiredText = (field: string) => z.string().trim().min(1, `${field} is required.`)
const optionalText = z.string().trim().optional().nullable()
const moneyAmount = z.number().finite().min(0, 'Amount cannot be negative.')
const percentAmount = z.number().finite().min(0, 'Deposit cannot be below 0%.').max(100, 'Deposit cannot be above 100%.')

const fileSchema = z.custom<File>((value) => {
  if (typeof File === 'undefined') return true
  return value instanceof File
}, 'Invalid file upload.')

export const newJobClientStepSchema = z.object({
  clientId: z.string().uuid().optional().nullable(),
  clientName: requiredText('Client name'),
  clientPhone: requiredText('Client phone'),
  clientSex: z.enum(['Male', 'Female']),
  title: requiredText('Job title'),
  orderMode: z.enum(['New Stitch', 'Amendment / Repair']),
  makeCategory: z.enum(['Body Wear', 'Non-Body Item']),
  orderScope: z.enum(['Single', 'Couple', 'Family']),
  sameItemForAll: z.boolean(),
  itemType: requiredText('Item type'),
  description: optionalText,
  measurementUnit: z.enum(['inches', 'centimeters']).default('inches'),
})

export const newJobMaterialStepSchema = z.object({
  amendmentIssueType: optionalText,
  amendmentArea: optionalText,
  amendmentTarget: optionalText,
  amendmentDescription: optionalText,
  amendmentNeedsMaterials: z.boolean().optional(),
  amendmentPartName: optionalText,
  amendmentPartQuantity: optionalText,
  materialType: optionalText,
  materialColor: optionalText,
  materialYards: z.number().finite().min(0).optional().nullable(),
  materialQuality: z.enum(['Normal', 'Original', 'Fake', 'High Standard']).optional().nullable(),
  materialSource: z.enum(['Client is Providing Material', 'I Am Getting It']).optional().nullable(),
})

export const newJobCostingStepSchema = z.object({
  chargeAmount: moneyAmount,
  depositPercent: percentAmount,
  totalExpenses: moneyAmount,
  projectedProfit: z.number().finite(),
  isWorthIt: z.boolean(),
  expenses: z.array(z.object({
    name: z.string().trim(),
    cost: moneyAmount,
  })).default([]),
})

export const newJobDeadlineStepSchema = z.object({
  deadlineDate: z.string().trim().optional().nullable(),
  deadlineTime: z.string().trim().optional().nullable(),
  reminder: z.enum(['1 day before', '3 days before', '1 week before', 'none']),
  referencePhotos: z.array(fileSchema).default([]),
})

export const newJobPersonSchema = z.object({
  name: requiredText('Person name'),
  sex: z.enum(['Male', 'Female', 'Boy', 'Girl']),
  role: z.enum(['adult', 'child']),
  age: optionalText,
  itemType: optionalText,
  description: optionalText,
  isPrimary: z.boolean(),
  measurementKind: z.enum(['body', 'non_body']),
  quantity: optionalText,
  measurements: z.record(z.string(), z.union([z.string(), z.number()])),
  measurementUnit: z.enum(['inches', 'centimeters']),
  sortOrder: z.number().int().positive(),
})

export const createFullJobSchema = newJobClientStepSchema
  .merge(newJobMaterialStepSchema)
  .merge(newJobCostingStepSchema)
  .merge(newJobDeadlineStepSchema)
  .extend({
    status: z.enum(['Pending', 'In Progress', 'Completed']).optional(),
    persons: z.array(newJobPersonSchema).min(1, 'Add at least one person or item measurement.'),
  })
  .superRefine((input, context) => {
    if (input.depositPercent > 0 && input.chargeAmount <= 0) {
      context.addIssue({ code: 'custom', path: ['chargeAmount'], message: 'Enter a charge amount before collecting deposit.' })
    }

    if (input.deadlineDate && Number.isNaN(Date.parse(input.deadlineDate))) {
      context.addIssue({ code: 'custom', path: ['deadlineDate'], message: 'Enter a valid delivery date.' })
    }
  })

export type CreateFullJobSchemaInput = z.infer<typeof createFullJobSchema>

export function validateCreateFullJobInput(input: unknown): CreateFullJobSchemaInput {
  const parsed = createFullJobSchema.safeParse(input)
  if (parsed.success) return parsed.data
  const message = parsed.error.issues.map((issue) => issue.message).join(' ')
  throw new Error(message || 'Please review this job before saving.')
}
