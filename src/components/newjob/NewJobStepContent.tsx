import { AnimatePresence, motion } from 'framer-motion'
import StepClientMeasurements from './StepClientMeasurements'
import StepCosting from './StepCosting'
import StepDeadlineReview from './StepDeadlineReview'
import StepMaterialPricing from './StepMaterialPricing'
import type { NewJobWizardModel } from './useNewJobWizard'

type NewJobStepContentProps = {
  wizard: NewJobWizardModel
}

export default function NewJobStepContent({ wizard }: NewJobStepContentProps) {
  const { actions, derived, repeatClient, state } = wizard

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.step}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.2 }}
        className="stack gap-12"
      >
        {state.step === 0 ? (
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
        ) : null}

        {state.step === 1 ? (
          <StepMaterialPricing
            isAmendmentMode={derived.isAmendmentMode}
            amendmentNeedsMaterials={state.amendmentNeedsMaterials}
            showFullMaterialFlow={derived.showFullMaterialFlow}
            showAmendmentMaterialFlow={derived.showAmendmentMaterialFlow}
            openMaterialCategory={state.openMaterialCategory}
            materialType={state.materialType}
            customMaterialType={state.customMaterialType}
            materialColor={state.materialColor}
            materialYards={state.materialYards}
            materialQuality={state.materialQuality}
            materialSource={state.materialSource}
            amendmentPartName={state.amendmentPartName}
            amendmentPartQuantity={state.amendmentPartQuantity}
            chargeAmount={state.chargeAmount}
            depositPercent={state.depositPercent}
            depositPercentValue={derived.depositPercentValue}
            deposit={derived.deposit}
            balance={derived.balance}
            referencePhotoNames={state.referencePhotoNames}
            onAmendmentMaterialsToggle={actions.handleAmendmentMaterialsToggle}
            onOpenMaterialCategoryChange={actions.setOpenMaterialCategory}
            onMaterialTypeChange={actions.setMaterialType}
            onCustomMaterialTypeChange={actions.setCustomMaterialType}
            onMaterialColorChange={actions.setMaterialColor}
            onMaterialYardsChange={actions.setMaterialYards}
            onMaterialQualityChange={actions.setMaterialQuality}
            onMaterialSourceChange={actions.setMaterialSource}
            onAmendmentPartNameChange={actions.setAmendmentPartName}
            onAmendmentPartQuantityChange={actions.setAmendmentPartQuantity}
            onChargeAmountChange={actions.setChargeAmount}
            onDepositPercentChange={actions.setDepositPercent}
            onDepositPercentKeyDown={actions.handleDepositPercentKeyDown}
            onReferencePhotoUpload={actions.handleReferencePhotoUpload}
          />
        ) : null}

        {state.step === 2 ? (
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
        ) : null}

        {state.step === 3 ? (
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
            expenses={state.expenses}
            totalExpenses={derived.totalExpenses}
            projectedProfit={derived.projectedProfit}
            onDeadlineDateChange={actions.setDeadlineDate}
            onDeadlineTimeChange={actions.setDeadlineTime}
            onReminderChange={actions.setReminder}
            onDetailsOpenChange={actions.setStepFourDetailsOpen}
          />
        ) : null}
      </motion.div>
    </AnimatePresence>
  )
}
