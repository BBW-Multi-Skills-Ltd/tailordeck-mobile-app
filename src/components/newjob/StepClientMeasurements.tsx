import AmendmentDetailsForm from './AmendmentDetailsForm'
import BodyMeasurementsSection from './BodyMeasurementsSection'
import { ClientIdentityFields } from './ClientIdentityFields'
import NonBodyMeasurementsForm from './NonBodyMeasurementsForm'
import { OrderSetupFields } from './OrderSetupFields'
import type { StepClientMeasurementsProps } from './stepClientMeasurements.types'

export default function StepClientMeasurements(props: StepClientMeasurementsProps) {
  const hasClientIdentity = Boolean(props.clientName.trim()) && Boolean(props.clientPhone.trim())

  return (
    <div className="stack gap-12">
      <ClientIdentityFields
        clientName={props.clientName}
        clientPhone={props.clientPhone}
        repeatClient={props.repeatClient}
        onClientNameChange={props.onClientNameChange}
        onClientPhoneChange={props.onClientPhoneChange}
      />

      {!hasClientIdentity ? null : (
        <>
          <OrderSetupFields {...props} />

          {props.showBodyMeasurementFlow ? (
            <BodyMeasurementsSection
              clientName={props.clientName}
              itemType={props.itemType}
              jobType={props.jobType}
              persons={props.persons}
              sameItemForAll={props.sameItemForAll}
              singleMeasurementsOpen={props.singleMeasurementsOpen}
              stepOneMeasurementsOpen={props.stepOneMeasurementsOpen}
              onAddAdult={props.onAddAdult}
              onAddChild={props.onAddChild}
              onRemovePerson={props.onRemovePerson}
              onSharedItemTypeChange={props.onSharedItemTypeChange}
              onSingleMeasurementsOpenChange={props.onSingleMeasurementsOpenChange}
              onTogglePersonMeasurements={props.onTogglePersonMeasurements}
              onUpdatePerson={props.onUpdatePerson}
              onUpdatePersonDescription={props.onUpdatePersonDescription}
              onUpdatePersonMeasurement={props.onUpdatePersonMeasurement}
            />
          ) : null}

          {props.showNonBodyMeasurementFlow ? (
            <NonBodyMeasurementsForm
              quantity={props.nonBodyQuantity}
              fields={props.selectedNonBodyFields}
              measurements={props.nonBodyMeasurements}
              description={props.nonBodyDescription}
              onQuantityChange={props.onNonBodyQuantityChange}
              onMeasurementChange={props.onNonBodyMeasurementChange}
              onDescriptionChange={props.onNonBodyDescriptionChange}
            />
          ) : null}

          {props.isAmendmentMode ? (
            <AmendmentDetailsForm
              issueType={props.amendmentIssueType}
              area={props.amendmentArea}
              target={props.amendmentTarget}
              description={props.amendmentDescription}
              onIssueTypeChange={props.onAmendmentIssueTypeChange}
              onAreaChange={props.onAmendmentAreaChange}
              onTargetChange={props.onAmendmentTargetChange}
              onDescriptionChange={props.onAmendmentDescriptionChange}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
