import type { KeyboardEvent } from 'react'
import { Upload } from 'lucide-react'
import { formatNaira } from '../../lib/utils'
import {
  amendmentPartOptions,
  digitsOnly,
  formatNairaInput,
  formatPercentInput,
  materialCategories,
  materialSources,
  qualities,
  type MaterialQuality,
  type MaterialSource,
} from './newJobConfig'
import MaterialSelector from './MaterialSelector'

type StepMaterialPricingProps = {
  isAmendmentMode: boolean
  amendmentNeedsMaterials: boolean
  showFullMaterialFlow: boolean
  showAmendmentMaterialFlow: boolean
  openMaterialCategory: string
  materialType: string
  customMaterialType: string
  materialColor: string
  materialYards: string
  materialQuality: MaterialQuality
  materialSource: MaterialSource
  amendmentPartName: string
  amendmentPartQuantity: string
  chargeAmount: string
  depositPercent: string
  depositPercentValue: number
  deposit: number
  balance: number
  referencePhotoNames: string[]
  onAmendmentMaterialsToggle: (needsMaterials: boolean) => void
  onOpenMaterialCategoryChange: (categoryId: string) => void
  onMaterialTypeChange: (value: string) => void
  onCustomMaterialTypeChange: (value: string) => void
  onMaterialColorChange: (value: string) => void
  onMaterialYardsChange: (value: string) => void
  onMaterialQualityChange: (quality: MaterialQuality) => void
  onMaterialSourceChange: (source: MaterialSource) => void
  onAmendmentPartNameChange: (value: string) => void
  onAmendmentPartQuantityChange: (value: string) => void
  onChargeAmountChange: (value: string) => void
  onDepositPercentChange: (value: string) => void
  onDepositPercentKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onReferencePhotoUpload: (files: FileList | null) => void
}

export default function StepMaterialPricing({
  isAmendmentMode,
  amendmentNeedsMaterials,
  showFullMaterialFlow,
  showAmendmentMaterialFlow,
  openMaterialCategory,
  materialType,
  customMaterialType,
  materialColor,
  materialYards,
  materialQuality,
  materialSource,
  amendmentPartName,
  amendmentPartQuantity,
  chargeAmount,
  depositPercent,
  depositPercentValue,
  deposit,
  balance,
  referencePhotoNames,
  onAmendmentMaterialsToggle,
  onOpenMaterialCategoryChange,
  onMaterialTypeChange,
  onCustomMaterialTypeChange,
  onMaterialColorChange,
  onMaterialYardsChange,
  onMaterialQualityChange,
  onMaterialSourceChange,
  onAmendmentPartNameChange,
  onAmendmentPartQuantityChange,
  onChargeAmountChange,
  onDepositPercentChange,
  onDepositPercentKeyDown,
  onReferencePhotoUpload,
}: StepMaterialPricingProps) {
  function handleDepositPercentChange(value: string): void {
    const digits = digitsOnly(value)
    onDepositPercentChange(digits ? String(Math.min(Number(digits), 100)) : '')
  }

  return (
    <div className="stack gap-12">
      {isAmendmentMode ? (
        <div className="input-group">
          <span className="input-label">Need extra materials or parts?</span>
          <div className="wizard-sex-group">
            <button type="button" className={`pill wizard-jobtype-pill${amendmentNeedsMaterials ? ' active' : ''}`} onClick={() => onAmendmentMaterialsToggle(true)}>
              Yes
            </button>
            <button type="button" className={`pill wizard-jobtype-pill${!amendmentNeedsMaterials ? ' active' : ''}`} onClick={() => onAmendmentMaterialsToggle(false)}>
              No
            </button>
          </div>
        </div>
      ) : null}

      {showFullMaterialFlow ? (
        <>
          <MaterialSelector
            categories={materialCategories}
            openCategoryId={openMaterialCategory}
            selectedMaterial={materialType}
            onOpenCategoryChange={onOpenMaterialCategoryChange}
            onSelectMaterial={onMaterialTypeChange}
          />

          {materialType === 'Other Material' ? (
            <label className="input-group">
              <span className="input-label">Custom Material</span>
              <input className="input" value={customMaterialType} onChange={(event) => onCustomMaterialTypeChange(event.target.value)} placeholder="Type your custom material here..." />
            </label>
          ) : null}

          <div className="wizard-step2-two-col">
            <label className="input-group">
              <span className="input-label">Color</span>
              <input className="input" value={materialColor} onChange={(event) => onMaterialColorChange(event.target.value)} placeholder="e.g. Navy Blue" />
            </label>

            <label className="input-group">
              <span className="input-label">Total Yards</span>
              <input className="input" value={materialYards} onChange={(event) => onMaterialYardsChange(event.target.value)} placeholder="0" inputMode="decimal" />
            </label>
          </div>

          <div className="input-group">
            <span className="input-label">Material Quality</span>
            <div className="wizard-quality-scroll">
              {qualities.map((quality) => (
                <button key={quality} type="button" className={`pill${materialQuality === quality ? ' active' : ''}`} onClick={() => onMaterialQualityChange(quality)}>
                  {quality}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {showAmendmentMaterialFlow ? (
        <>
          <label className="input-group">
            <span className="input-label">Material / Part Needed</span>
            <input
              className="input"
              value={amendmentPartName}
              onChange={(event) => {
                onAmendmentPartNameChange(event.target.value)
                onMaterialTypeChange(event.target.value)
              }}
              placeholder="e.g. Zip, Button, Fabric patch"
              list="amendment-part-options"
            />
            <datalist id="amendment-part-options">
              {amendmentPartOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </label>

          <div className="wizard-step2-two-col">
            <label className="input-group">
              <span className="input-label">Color (optional)</span>
              <input className="input" value={materialColor} onChange={(event) => onMaterialColorChange(event.target.value)} placeholder="e.g. Black" />
            </label>

            <label className="input-group">
              <span className="input-label">Part Quantity</span>
              <input className="input" value={amendmentPartQuantity} onChange={(event) => onAmendmentPartQuantityChange(event.target.value)} placeholder="0" inputMode="numeric" />
            </label>
          </div>
        </>
      ) : null}

      {showFullMaterialFlow || showAmendmentMaterialFlow ? (
        <div className="input-group">
          <span className="input-label">Material Source</span>
          <div className="wizard-source-grid">
            {materialSources.map((source) => (
              <button key={source} type="button" className={`wizard-material-source-btn${materialSource === source ? ' active' : ''}`} onClick={() => onMaterialSourceChange(source)}>
                {source === 'Client is Providing Material' ? 'Client Provided' : 'I Am Getting It'}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {isAmendmentMode && !amendmentNeedsMaterials ? (
        <article className="card stack gap-6">
          <p className="text-sm text-muted">No extra material selected for this amendment.</p>
          <p className="text-sm text-muted">You can continue with pricing and labor costing.</p>
        </article>
      ) : null}

      <label className="input-group">
        <span className="input-label">How much are you charging the client?</span>
        <p className="text-sm text-muted">Enter the total agreed price. TailorDeck auto-formats in Naira.</p>
        <input className="input" value={formatNairaInput(chargeAmount)} onChange={(event) => onChargeAmountChange(digitsOnly(event.target.value))} placeholder="₦0" inputMode="numeric" />
      </label>

      <label className="input-group">
        <span className="input-label">How many percent deposit are you collecting first?</span>
        <p className="text-sm text-muted">Set upfront percentage. Deposit and balance are calculated automatically.</p>
        <input
          className="input"
          value={formatPercentInput(depositPercent)}
          onKeyDown={onDepositPercentKeyDown}
          onChange={(event) => handleDepositPercentChange(event.target.value)}
          placeholder="0%"
          inputMode="numeric"
        />
      </label>

      <div className="card stack gap-8">
        <div className="row-between">
          <p className="text-sm text-muted">Deposit Percent</p>
          <p className="font-semibold">{depositPercentValue}%</p>
        </div>
        <div className="row-between">
          <p className="text-sm text-muted">Deposit to Collect Now</p>
          <p className="font-semibold">{formatNaira(deposit)}</p>
        </div>
        <div className="row-between">
          <p className="text-sm text-muted">Balance After Job Done</p>
          <p className="font-semibold">{formatNaira(balance)}</p>
        </div>
      </div>

      <div className="input-group">
        <span className="input-label wizard-inline-label">Have a reference photo? Upload if available.</span>
        <label className="wizard-upload-box">
          <input type="file" multiple accept="image/*" className="wizard-upload-input" onChange={(event) => onReferencePhotoUpload(event.target.files)} />
          <div className="row gap-8">
            <Upload size={18} className="text-muted" />
            <span className="wizard-upload-title">Tap to Upload Reference Images</span>
          </div>
        </label>
        {referencePhotoNames.length > 0 ? (
          <div className="stack gap-4">
            {referencePhotoNames.map((name) => (
              <p key={name} className="text-sm text-muted">{name}</p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
