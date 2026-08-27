import { useLayoutEffect } from 'react'
import { Lock } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { stepLabels } from '../components/newjob/newJobConfig'
import {
  JobSuccessView,
  NewJobHeader,
  ReviewProgressHeader,
  StepProgress,
  WizardFooter,
  WizardLoadingOverlay,
} from '../components/newjob/NewJobChrome'
import NewJobStepContent from '../components/newjob/NewJobStepContent'
import { useNewJobWizard } from '../components/newjob/useNewJobWizard'
import EmptyState from '../components/shared/EmptyState'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'
import { useJobCreationEntitlementQuery } from '../hooks/useFeatureAccess'
import { scrollAppToTop } from '../lib/scroll'
import { getJobCreationBlockedMessage } from '../services/subscriptionService'

export default function NewJob() {
  const [searchParams] = useSearchParams()
  const draftId = searchParams.get('draftId')
  const jobCreationEntitlement = useJobCreationEntitlementQuery(!draftId)
  const wizard = useNewJobWizard()
  const { actions, derived, sectionRef, state } = wizard
  const hasStepProgress = !state.stepFourReviewMode
  const creationBlocked = !draftId && jobCreationEntitlement.data?.can_create_job === false

  useLayoutEffect(() => {
    scrollAppToTop('auto')
  }, [state.step, state.stepFourReviewMode])

  if (state.successOpen) {
    return (
      <JobSuccessView
        createdJobId={state.createdJobId}
        clientName={state.clientName}
        clientPhone={state.clientPhone}
        color={state.materialColor}
        deadlineTime={state.deadlineTime}
        deposit={derived.deposit}
        effectiveItemType={derived.effectiveItemType || state.amendmentIssueType}
        expenses={state.expenses}
        jobType={state.jobType}
        makeCategory={state.makeCategory}
        materialQuality={state.materialQuality}
        materialSource={state.materialSource}
        materialType={derived.selectedMaterialValue}
        orderMode={state.orderMode}
        reminder={state.reminder || 'none'}
        scopeLabel={derived.scopeLabel}
        charge={derived.charge}
        deadlineDate={state.deadlineDate}
        totalYard={state.materialYards}
        onViewJobDetails={actions.viewCreatedJob}
      />
    )
  }

  if (creationBlocked) {
    return (
      <section className="section stack gap-16">
        <PageHeader title="New Job" centered leading={<HistoryBackButton fallbackTo="/jobs" />} />
        <EmptyState
          icon={Lock}
          title="Free job limit reached"
          description={getJobCreationBlockedMessage(jobCreationEntitlement.data)}
          actionLabel="View Plans"
          actionTo="/settings/subscription"
        />
      </section>
    )
  }

  return (
    <section ref={sectionRef} className={`section stack gap-16 wizard-page${hasStepProgress ? ' wizard-page-has-progress' : ''}`}>
      <div className={`wizard-fixed-top${hasStepProgress ? ' has-progress' : ''}`}>
        <NewJobHeader onBack={actions.goBack} />
        {hasStepProgress ? <StepProgress step={state.step} labels={stepLabels} /> : <ReviewProgressHeader />}
      </div>

      {state.wizardError ? <p className="inline-feedback-error wizard-inline-error" role="alert">{state.wizardError}</p> : null}
      <NewJobStepContent wizard={wizard} />

      <WizardFooter
        step={state.step}
        isReviewMode={state.stepFourReviewMode}
        isFinalizing={state.isFinalizing}
        isSavingDraft={state.isSavingDraft}
        draftSaved={state.draftSaved}
        onBack={actions.goBack}
        onNext={actions.goNext}
        onProceedToReview={actions.proceedToReview}
        onSaveDraft={actions.saveDraft}
        onFinalize={actions.handleFinalizeJob}
      />

      {state.isFinalizing || state.isSavingDraft ? (
        <WizardLoadingOverlay message={state.isSavingDraft ? 'Saving to draft...' : 'Creating contract...'} />
      ) : null}
    </section>
  )
}
