export type DetailedExpense = {
  name: string
  cost: number
}

export type DetailedJobData = {
  orderMode: 'New Stitch' | 'Amendment / Repair'
  jobType: 'Body Wear' | 'Non-Body Item'
  itemType: string
  orderScope: string
  measurement: string
  materialType: string
  color: string
  totalYard: string
  materialQuality: string
  materialSource: string
  deliveryTime: string
  reminder: string
  referencePhotos: string[]
  expenses: DetailedExpense[]
  depositAmount: number
}
