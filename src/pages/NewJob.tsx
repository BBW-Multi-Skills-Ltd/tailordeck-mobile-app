import { stepLabels } from '../components/newjob/newJobConfig'
import {
  JobSuccessView,
  NewJobHeader,
  StepProgress,
  WizardFooter,
  WizardLoadingOverlay,
} from '../components/newjob/NewJobChrome'
import NewJobStepContent from '../components/newjob/NewJobStepContent'
import { useNewJobWizard } from '../components/newjob/useNewJobWizard'

export default function NewJob() {
  const wizard = useNewJobWizard()
  const { actions, derived, sectionRef, state } = wizard

  if (state.successOpen) {
    return (
      <JobSuccessView
        clientName={state.clientName}
        jobType={state.jobType}
        charge={derived.charge}
        deadlineDate={state.deadlineDate}
        onViewJobs={actions.viewJobs}
      />
    )
  }

  return (
    <section ref={sectionRef} className="section stack gap-16 wizard-page">
      <NewJobHeader onBack={actions.goBack} />
      <StepProgress step={state.step} labels={stepLabels} />

      <NewJobStepContent wizard={wizard} />

      <WizardFooter
        step={state.step}
        isReviewMode={state.stepFourReviewMode}
        isFinalizing={state.isFinalizing}
        onBack={actions.goBack}
        onNext={actions.goNext}
        onProceedToReview={() => actions.setStepFourReviewMode(true)}
        onSaveDraft={actions.saveDraft}
        onFinalize={actions.handleFinalizeJob}
      />

      {state.isFinalizing ? <WizardLoadingOverlay /> : null}
    </section>
  )
}
