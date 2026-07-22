import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BillingSummarySection, CurrentPlanSection } from '../components/subscription/manage/ManagePlanSummarySections'
import { CancelPlanDialog } from '../components/subscription/manage/CancelPlanDialog'
import { ChangePlanSection } from '../components/subscription/manage/ChangePlanSection'
import { ManagePlanSupportSection, PaymentHistorySection, SubscriptionControlSection } from '../components/subscription/manage/ManagePlanControlSections'
import { useManagePlanState } from '../components/subscription/manage/useManagePlanState'
import PageHeader from '../components/shared/PageHeader'

export default function ManagePlan() {
  const { actions, state } = useManagePlanState()

  return (
    <section className="section stack gap-12 manage-plan-page">
      <PageHeader
        title="Manage Plan"
        centered
        leading={(
          <Link to="/settings/subscription" className="btn btn-ghost btn-icon" aria-label="Back to subscription">
            <ArrowLeft size={18} />
          </Link>
        )}
      />

      <CurrentPlanSection
        cancelScheduled={state.cancelScheduled}
        currentPlan={state.currentPlan}
        isPaidPlan={state.isPaidPlan}
        trialEndDate={state.trialEndDate}
      />

      <BillingSummarySection
        currentPlan={state.currentPlan}
        cycle={state.cycle}
        isPaidPlan={state.isPaidPlan}
        renewalDate={state.renewalDate}
        trialEndDate={state.trialEndDate}
      />

      <ChangePlanSection
        changePlanOptions={state.changePlanOptions}
        currentPlan={state.plan}
        cycle={state.cycle}
        selectedPlan={state.selectedPlan}
        onChoosePlan={actions.choosePlan}
        onCycleChange={actions.setCycle}
        onSelectedPlanChange={actions.setSelectedPlan}
      />

      <SubscriptionControlSection
        cancelScheduled={state.cancelScheduled}
        isPaidPlan={state.isPaidPlan}
        onCancelClick={() => actions.setCancelOpen(true)}
        onKeepActive={actions.keepPlanActive}
      />

      <PaymentHistorySection />
      <ManagePlanSupportSection />

      {state.cancelOpen ? (
        <CancelPlanDialog isPaidPlan={state.isPaidPlan} onClose={() => actions.setCancelOpen(false)} onConfirm={actions.confirmCancel} />
      ) : null}
    </section>
  )
}
