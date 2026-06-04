import { AnimatePresence, motion } from 'framer-motion'
import { RenderClientMeasurementStep, RenderCostingStep, RenderDeadlineReviewStep, RenderMaterialPricingStep } from './NewJobStepRenderers'
import type { NewJobWizardModel } from './useNewJobWizard'

type NewJobStepContentProps = {
  wizard: NewJobWizardModel
}

export default function NewJobStepContent({ wizard }: NewJobStepContentProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={wizard.state.step}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.2 }}
        className="stack gap-12"
      >
        {wizard.state.step === 0 ? <RenderClientMeasurementStep wizard={wizard} /> : null}
        {wizard.state.step === 1 ? <RenderMaterialPricingStep wizard={wizard} /> : null}
        {wizard.state.step === 2 ? <RenderCostingStep wizard={wizard} /> : null}
        {wizard.state.step === 3 ? <RenderDeadlineReviewStep wizard={wizard} /> : null}
      </motion.div>
    </AnimatePresence>
  )
}
