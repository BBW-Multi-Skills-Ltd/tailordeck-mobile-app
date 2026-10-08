export type JobStatus = 'Draft' | 'Pending' | 'In Progress' | 'Completed'

export interface Job {
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

