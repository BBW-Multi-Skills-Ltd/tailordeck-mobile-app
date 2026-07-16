import { formatNaira } from '../../lib/utils'
import { digitsOnly, formatNairaInput, formatPercentInput } from './newJobConfig'
import type { KeyboardEvent } from 'react'

export type PricingDepositFieldsProps = {
  balance: number
  chargeAmount: string
  deposit: number
  depositPercent: string
  depositPercentValue: number
  onChargeAmountChange: (value: string) => void
  onDepositPercentChange: (value: string) => void
  onDepositPercentKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
}

export function PricingDepositFields(props: PricingDepositFieldsProps) {
  function handleDepositPercentChange(value: string): void {
    const digits = digitsOnly(value)
    props.onDepositPercentChange(digits ? String(Math.min(Number(digits), 100)) : '')
  }

  return (
    <div className="wizard-pricing-stack">
      <div className="card wizard-pricing-entry-card">
        <div className="wizard-pricing-input-grid">
        <label className="input-group">
          <span className="input-label">Charge amount</span>
          <input className="input" value={formatNairaInput(props.chargeAmount)} onChange={(event) => props.onChargeAmountChange(digitsOnly(event.target.value))} placeholder={formatNairaInput('0')} inputMode="numeric" />
        </label>

        <label className="input-group">
          <span className="input-label">Deposit %</span>
          <input
            className="input"
            value={formatPercentInput(props.depositPercent)}
            onKeyDown={props.onDepositPercentKeyDown}
            onChange={(event) => handleDepositPercentChange(event.target.value)}
            placeholder="0%"
            inputMode="numeric"
          />
        </label>
        </div>
      </div>

      <div className="card stack gap-8 wizard-deposit-summary-card">
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
    </div>
  )
}
