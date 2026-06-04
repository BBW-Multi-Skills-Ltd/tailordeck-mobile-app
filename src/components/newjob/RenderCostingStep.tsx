import StepCosting from './StepCosting'
import type { NewJobWizardModel } from './useNewJobWizard'

type StepRendererProps = {
  wizard: NewJobWizardModel
}

export function RenderCostingStep({ wizard }: StepRendererProps) {
  const { actions, derived, state } = wizard

  return (
    <StepCosting
      expenseDraftName={state.expenseDraftName}
      expenseDraftCost={state.expenseDraftCost}
      expenses={state.expenses}
      charge={derived.charge}
      totalExpenses={derived.totalExpenses}
      projectedProfit={derived.projectedProfit}
      worthIt={state.worthIt}
      onExpenseDraftNameChange={actions.setExpenseDraftName}
      onExpenseDraftCostChange={actions.setExpenseDraftCost}
      onAddExpense={actions.addExpense}
      onRemoveExpense={actions.removeExpense}
      onWorthItChange={actions.setWorthIt}
    />
  )
}

