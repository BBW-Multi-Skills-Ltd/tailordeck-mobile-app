import { formatNaira } from '../../lib/utils'
import { digitsOnly, formatNairaInput, formatPercentInput } from './newJobConfig'
import type { KeyboardEvent } from 'react'

export type PricingDepositFieldsProps = {
  balance: number
  chargeAmount: string
  chargeAmountError?: string
  deposit: number
  depositPercent: string
  depositPercentError?: string
  depositPercentValue: number
  errorKey?: number
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
          <input
            key={`charge-amount-${props.errorKey ?? 0}`}
            className={`input${props.chargeAmountError ? ' input-invalid input-shake' : ''}`}
            value={formatNairaInput(props.chargeAmount)}
            onChange={(event) => props.onChargeAmountChange(digitsOnly(event.target.value))}
            placeholder={formatNairaInput('0')}
            inputMode="numeric"
            aria-invalid={Boolean(props.chargeAmountError)}
          />
          {props.chargeAmountError ? <span className="input-error-text">{props.chargeAmountError}</span> : null}
        </label>

        <label className="input-group">
          <span className="input-label">Deposit %</span>
          <input
            key={`deposit-percent-${props.errorKey ?? 0}`}
            className={`input${props.depositPercentError ? ' input-invalid input-shake' : ''}`}
            value={formatPercentInput(props.depositPercent)}
            onKeyDown={props.onDepositPercentKeyDown}
            onChange={(event) => handleDepositPercentChange(event.target.value)}
            placeholder="0%"
            inputMode="numeric"
            aria-invalid={Boolean(props.depositPercentError)}
          />
          {props.depositPercentError ? <span className="input-error-text">{props.depositPercentError}</span> : null}
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
