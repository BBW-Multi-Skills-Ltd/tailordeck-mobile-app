export type JobStatus = 'Pending' | 'In Progress' | 'Completed'

export interface MockJob {
  id: string
  clientId: string
  clientName: string
  clientPhone: string
  title: string
  jobType: 'Single' | 'Couple' | 'Family'
  chargeAmount: number
  status: JobStatus
  deadlineDate: string
  createdDate: string
}

