import { formatNaira } from '../../lib/utils'
import { digitsOnly, formatNairaInput, formatPercentInput } from './newJobConfig'
import type { StepMaterialPricingProps } from './stepMaterialPricing.types'

type PricingDepositFieldsProps = Pick<
  StepMaterialPricingProps,
  | 'balance'
  | 'chargeAmount'
  | 'deposit'
  | 'depositPercent'
  | 'depositPercentValue'
  | 'onChargeAmountChange'
  | 'onDepositPercentChange'
  | 'onDepositPercentKeyDown'
>

export function PricingDepositFields(props: PricingDepositFieldsProps) {
  function handleDepositPercentChange(value: string): void {
    const digits = digitsOnly(value)
    props.onDepositPercentChange(digits ? String(Math.min(Number(digits), 100)) : '')
  }

  return (
    <>
      <label className="input-group">
        <span className="input-label">How much are you charging the client?</span>
        <p className="text-sm text-muted">Enter the total agreed price. TailorDeck auto-formats in Naira.</p>
        <input className="input" value={formatNairaInput(props.chargeAmount)} onChange={(event) => props.onChargeAmountChange(digitsOnly(event.target.value))} placeholder={formatNairaInput('0')} inputMode="numeric" />
      </label>

      <label className="input-group">
        <span className="input-label">How many percent deposit are you collecting first?</span>
        <p className="text-sm text-muted">Set upfront percentage. Deposit and balance are calculated automatically.</p>
        <input
          className="input"
          value={formatPercentInput(props.depositPercent)}
          onKeyDown={props.onDepositPercentKeyDown}
          onChange={(event) => handleDepositPercentChange(event.target.value)}
          placeholder="0%"
          inputMode="numeric"
        />
      </label>

      <div className="card stack gap-8">
        <div className="row-between">
          <p className="text-sm text-muted">Deposit Percent</p>
          <p className="font-semibold">{props.depositPercentValue}%</p>
        </div>
        <div className="row-between">
          <p className="text-sm text-muted">Deposit to Collect Now</p>
          <p className="font-semibold">{formatNaira(props.deposit)}</p>
        </div>
        <div className="row-between">
          <p className="text-sm text-muted">Balance After Job Done</p>
          <p className="font-semibold">{formatNaira(props.balance)}</p>
        </div>
      </div>
    </>
  )
}
