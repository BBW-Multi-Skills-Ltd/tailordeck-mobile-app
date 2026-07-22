import { useMemo } from 'react'
import type { DetailedJobData } from '../../../data/mockJobDetails'
import type { MockJob } from '../../../types/job'
import { readBrandConfig } from '../../invoice/documentHelpers'
import type { JobSuccessViewProps } from './jobSuccessTypes'

export function useJobSuccessDocumentData({
  charge,
  clientName,
  clientPhone,
  color,
  deadlineDate,
  deadlineTime,
  deposit,
  effectiveItemType,
  expenses,
  jobType,
  makeCategory,
  materialQuality,
  materialSource,
  materialType,
  orderMode,
  reminder,
  scopeLabel,
  totalYard,
}: JobSuccessViewProps) {
  const brand = useMemo(() => readBrandConfig(), [])
  const balanceToCollect = Math.max(charge - deposit, 0)
  const service = effectiveItemType || 'Tailoring job'
  const successJob = useMemo<MockJob>(
    () => ({
      id: `new-job-${Date.now()}`,
      clientId: 'new-client',
      clientName: clientName || 'Client',
      clientPhone,
      title: service,
      jobType: scopeLabel === 'Couple' || scopeLabel === 'Family' ? scopeLabel : 'Single',
      chargeAmount: charge,
      status: 'Pending',
      deadlineDate,
      createdDate: new Date().toISOString(),
    }),
    [charge, clientName, clientPhone, deadlineDate, scopeLabel, service],
  )
  const successDetails = useMemo<DetailedJobData>(
    () => ({
      orderMode,
      jobType: makeCategory,
      itemType: service,
      orderScope: jobType,
      measurement: `${jobType} measurement captured`,
      materialType: materialType || '-',
      color: color || '-',
      totalYard: totalYard || '0',
      materialQuality: materialQuality || 'Normal',
      materialSource: materialSource || '-',
      deliveryTime: deadlineTime || '-',
      reminder,
      referencePhotos: [],
      expenses: expenses.map((expense) => ({
        name: expense.name,
        cost: Number(expense.cost.replace(/\D/g, '')) || 0,
      })),
      depositAmount: deposit,
    }),
    [color, deadlineTime, deposit, expenses, jobType, makeCategory, materialQuality, materialSource, materialType, orderMode, reminder, service, totalYard],
  )

  return { balanceToCollect, brand, successDetails, successJob }
}
