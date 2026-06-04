import StepMaterialPricing from './StepMaterialPricing'
import type { NewJobWizardModel } from './useNewJobWizard'

type StepRendererProps = {
  wizard: NewJobWizardModel
}

export function RenderMaterialPricingStep({ wizard }: StepRendererProps) {
  const { actions, derived, state } = wizard

  return (
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
  )
}

