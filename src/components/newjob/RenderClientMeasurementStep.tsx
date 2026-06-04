import StepClientMeasurements from './StepClientMeasurements'
import type { NewJobWizardModel } from './useNewJobWizard'

type StepRendererProps = {
  wizard: NewJobWizardModel
}

export function RenderClientMeasurementStep({ wizard }: StepRendererProps) {
  const { actions, derived, repeatClient, state } = wizard

  return (
    <StepClientMeasurements
      repeatClient={repeatClient}
      clientName={state.clientName}
      clientPhone={state.clientPhone}
      makeCategory={state.makeCategory}
      orderMode={state.orderMode}
      itemType={state.itemType}
      jobType={state.jobType}
      sameItemForAll={state.sameItemForAll}
      showBodyMeasurementFlow={derived.showBodyMeasurementFlow}
      showNonBodyMeasurementFlow={derived.showNonBodyMeasurementFlow}
      isAmendmentMode={derived.isAmendmentMode}
      persons={state.persons}
      singleMeasurementsOpen={state.singleMeasurementsOpen}
      stepOneMeasurementsOpen={state.stepOneMeasurementsOpen}
      selectedNonBodyFields={derived.selectedNonBodyFields}
      nonBodyMeasurements={state.nonBodyMeasurements}
      nonBodyQuantity={state.nonBodyQuantity}
      nonBodyDescription={state.nonBodyDescription}
      amendmentIssueType={state.amendmentIssueType}
      amendmentArea={state.amendmentArea}
      amendmentTarget={state.amendmentTarget}
      amendmentDescription={state.amendmentDescription}
      onClientNameChange={actions.handleClientNameChange}
      onClientPhoneChange={actions.setClientPhone}
      onMakeCategoryChange={actions.handleMakeCategoryChange}
      onOrderModeChange={actions.handleOrderModeChange}
      onSharedItemTypeChange={actions.updateSharedItemType}
      onJobTypeChange={actions.handleJobTypeChange}
      onSameItemToggle={actions.handleSameItemToggle}
      onSingleMeasurementsOpenChange={actions.setSingleMeasurementsOpen}
      onTogglePersonMeasurements={actions.toggleStepOneMeasurements}
      onUpdatePerson={actions.updatePerson}
      onUpdatePersonMeasurement={actions.updatePersonMeasurement}
      onUpdatePersonDescription={actions.updatePersonDescription}
      onRemovePerson={actions.removePerson}
      onAddAdult={actions.addAdult}
      onAddChild={actions.addChild}
      onNonBodyQuantityChange={actions.setNonBodyQuantity}
      onNonBodyMeasurementChange={actions.updateNonBodyMeasurement}
      onNonBodyDescriptionChange={actions.setNonBodyDescription}
      onAmendmentIssueTypeChange={actions.setAmendmentIssueType}
      onAmendmentAreaChange={actions.setAmendmentArea}
      onAmendmentTargetChange={actions.setAmendmentTarget}
      onAmendmentDescriptionChange={actions.setAmendmentDescription}
    />
  )
}

