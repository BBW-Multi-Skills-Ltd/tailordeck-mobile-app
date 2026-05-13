export type ClientJobSummary = {
  id: string
  clientId: string
  title: string
  deadlineDate: string
  status: 'Pending' | 'In Progress' | 'Completed'
}

export const mockClientJobs: ClientJobSummary[] = [
  {
    id: 'j-001',
    clientId: 'c-001',
    title: 'Wedding Lace Gown',
    deadlineDate: '2026-05-20',
    status: 'In Progress',
  },
  {
    id: 'j-002',
    clientId: 'c-001',
    title: 'Church Native Set',
    deadlineDate: '2026-05-25',
    status: 'Pending',
  },
  {
    id: 'j-003',
    clientId: 'c-002',
    title: 'Senator Suit',
    deadlineDate: '2026-05-18',
    status: 'Completed',
  },
]

