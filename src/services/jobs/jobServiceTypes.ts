import type { JobStatus } from '../../types/job'
import type { JobPersonRow, JobRow } from '../types'

export interface CreateJobInput {
  clientId?: string | null
  clientName: string
  clientPhone: string
  title: string
  orderMode: JobRow['order_mode']
  makeCategory: JobRow['make_category']
  orderScope: JobRow['order_scope']
  itemType: string
  description?: string
  chargeAmount: number
  depositPercent: number
  deadlineDate?: string
  deadlineTime?: string
  reminder: JobRow['reminder']
  status?: JobStatus
}

export interface CreateJobPersonInput {
  name: string
  sex: JobPersonRow['sex']
  role: JobPersonRow['role']
  age?: string | null
  itemType?: string | null
  description?: string | null
  isPrimary: boolean
  measurementKind: JobPersonRow['measurement_kind']
  quantity?: string | null
  measurements: Record<string, number | string>
  measurementUnit: JobPersonRow['measurement_unit']
  sortOrder: number
}

export interface CreateJobReferencePhotoInput {
  file: File
  targetId?: string | null
  targetLabel?: string | null
  sortOrder: number
}

export interface CreateFullJobInput extends CreateJobInput {
  clientSex: 'Male' | 'Female'
  measurementUnit: JobPersonRow['measurement_unit']
  sameItemForAll: boolean
  amendmentIssueType?: string
  amendmentArea?: string
  amendmentTarget?: string
  amendmentDescription?: string
  amendmentNeedsMaterials?: boolean
  amendmentPartName?: string
  amendmentPartQuantity?: string
  materialType?: string
  materialColor?: string
  materialYards?: number | null
  materialQuality?: JobRow['material_quality']
  materialSource?: JobRow['material_source']
  totalExpenses: number
  projectedProfit: number
  isWorthIt: boolean
  persons: CreateJobPersonInput[]
  expenses: Array<{ name: string; cost: number }>
  referencePhotos: CreateJobReferencePhotoInput[]
}
