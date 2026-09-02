import { BillingSummarySection, CurrentPlanSection } from '../components/subscription/manage/ManagePlanSummarySections'
import { CancelPlanDialog } from '../components/subscription/manage/CancelPlanDialog'
import { ChangePlanSection } from '../components/subscription/manage/ChangePlanSection'
import { ManagePlanSupportSection, SubscriptionControlSection } from '../components/subscription/manage/ManagePlanControlSections'
import { useManagePlanState } from '../components/subscription/manage/useManagePlanState'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'

export default function ManagePlan() {
  const { actions, state } = useManagePlanState()

  return (
    <section className="section stack gap-12 manage-plan-page">
      <PageHeader
        title="Manage Plan"
        centered
        leading={<HistoryBackButton fallbackTo="/settings/subscription" />}
      />

      <CurrentPlanSection
        cancelScheduled={state.cancelScheduled}
        currentPlan={state.currentPlan}
        isPaidPlan={state.isPaidPlan}
        isTrialActive={state.isTrialActive}
        trialEndDate={state.trialEndDate}
      />

      <BillingSummarySection
        currentPlan={state.currentPlan}
        cycle={state.cycle}
        isPaidPlan={state.isPaidPlan}
        isTrialActive={state.isTrialActive}
        renewalDate={state.renewalDate}
        trialEndDate={state.trialEndDate}
      />

      <ChangePlanSection
        changePlanOptions={state.changePlanOptions}
        currentPlan={state.plan}
        cycle={state.cycle}
        isBusy={state.isBusy}
        selectedPlan={state.selectedPlan}
        onChoosePlan={actions.choosePlan}
        onCycleChange={actions.setCycle}
        onSelectedPlanChange={actions.setSelectedPlan}
      />

      {state.actionError ? <p className="auth-feedback error" role="alert">{state.actionError}</p> : null}
      {state.actionNotice ? <p className="auth-feedback success" role="status">{state.actionNotice}</p> : null}

      <SubscriptionControlSection
        cancelScheduled={state.cancelScheduled}
        isBusy={state.isBusy}
        isPaidPlan={state.isPaidPlan}
        onCancelClick={() => actions.setCancelOpen(true)}
        onKeepActive={actions.keepPlanActive}
      />

      <ManagePlanSupportSection />

      {state.cancelOpen ? (
        <CancelPlanDialog isPaidPlan={state.isPaidPlan} onClose={() => actions.setCancelOpen(false)} onConfirm={actions.confirmCancel} />
      ) : null}
    </section>
  )
}
