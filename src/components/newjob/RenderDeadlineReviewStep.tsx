import StepDeadlineReview from './StepDeadlineReview'
import type { NewJobWizardModel } from './useNewJobWizard'

type StepRendererProps = {
  wizard: NewJobWizardModel
}

export function RenderDeadlineReviewStep({ wizard }: StepRendererProps) {
  const { actions, derived, state } = wizard

  return (
    <StepDeadlineReview
      reviewMode={state.stepFourReviewMode}
      detailsOpen={state.stepFourDetailsOpen}
      draftSaved={state.draftSaved}
      balance={derived.balance}
      reminder={state.reminder}
      deadlineDate={state.deadlineDate}
      deadlineTime={state.deadlineTime}
      clientName={state.clientName}
      clientPhone={state.clientPhone}
      jobType={state.jobType}
      orderMode={state.orderMode}
      makeCategory={state.makeCategory}
      scopeLabel={derived.scopeLabel}
      sameItemForAll={state.sameItemForAll}
      effectiveItemType={derived.effectiveItemType}
      persons={state.persons}
      selectedNonBodyFields={derived.selectedNonBodyFields}
      isAmendmentMode={derived.isAmendmentMode}
      nonBodyDescription={state.nonBodyDescription}
      amendmentIssueType={state.amendmentIssueType}
      amendmentArea={state.amendmentArea}
      amendmentTarget={state.amendmentTarget}
      amendmentDescription={state.amendmentDescription}
      selectedMaterialValue={derived.selectedMaterialValue}
      materialColor={state.materialColor}
      materialYards={state.materialYards}
      materialQuality={state.materialQuality}
      materialSource={state.materialSource}
      charge={derived.charge}
      deposit={derived.deposit}
      referencePhotoNames={state.referencePhotoNames}
      referencePhotoNamesByTarget={state.referencePhotoNamesByTarget}
      fieldErrors={state.fieldErrors}
      expenses={state.expenses}
      totalExpenses={derived.totalExpenses}
      projectedProfit={derived.projectedProfit}
      onDeadlineDateChange={actions.setDeadlineDate}
      onDeadlineTimeChange={actions.setDeadlineTime}
      onReferencePhotoUpload={actions.handleReferencePhotoUpload}
      onReminderChange={actions.setReminder}
      onDetailsOpenChange={actions.setStepFourDetailsOpen}
    />
  )
}
