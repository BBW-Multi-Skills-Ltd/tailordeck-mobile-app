import type { StepClientMeasurementsProps } from '../stepClientMeasurements.types'

export type OrderSetupFieldsProps = Pick<
  StepClientMeasurementsProps,
  | 'isAmendmentMode'
  | 'itemType'
  | 'jobType'
  | 'makeCategory'
  | 'orderMode'
  | 'sameItemForAll'
  | 'showBodyMeasurementFlow'
  | 'onJobTypeChange'
  | 'onMakeCategoryChange'
  | 'onOrderModeChange'
  | 'onSameItemToggle'
  | 'onSharedItemTypeChange'
>
