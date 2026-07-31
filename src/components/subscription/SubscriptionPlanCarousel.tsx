import { Check } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import type { BillingCycle, SubscriptionPlanCard } from '../../lib/subscriptionPlans'

type SubscriptionPlanCarouselProps<TPlan extends SubscriptionPlanCard> = {
  ariaLabel: string
  busyPlanId?: TPlan['id'] | null
  getBusyLabel?: (plan: TPlan) => string
  className?: string
  cycle: BillingCycle
  disabled?: boolean
  getCtaLabel: (plan: TPlan) => string
  plans: TPlan[]
  selectedPlan: TPlan['id']
  onChoosePlan: (plan: TPlan) => void | Promise<void>
  onSelectedPlanChange: (planId: TPlan['id']) => void
}

export function SubscriptionPlanCarousel<TPlan extends SubscriptionPlanCard>({
  ariaLabel,
  busyPlanId,
  className,
  cycle,
  disabled = false,
  getCtaLabel,
  getBusyLabel,
  plans,
  selectedPlan,
  onChoosePlan,
  onSelectedPlanChange,
}: SubscriptionPlanCarouselProps<TPlan>) {
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef(new Map<string, HTMLElement>())

  const updateSelectedFromScroll = useCallback(() => {
    const carousel = carouselRef.current
    if (!carousel || plans.length <= 1) return

    const carouselLeft = carousel.getBoundingClientRect().left
    const nearest = plans
      .map((plan) => {
        const card = cardRefs.current.get(plan.id)
        if (!card) return { id: plan.id, distance: Number.POSITIVE_INFINITY }
        return { id: plan.id, distance: Math.abs(card.getBoundingClientRect().left - carouselLeft) }
      })
      .sort((a, b) => a.distance - b.distance)[0]

    if (nearest && nearest.id !== selectedPlan) onSelectedPlanChange(nearest.id)
  }, [onSelectedPlanChange, plans, selectedPlan])

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    let frame = 0
    function handleScroll(): void {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(updateSelectedFromScroll)
    }

    carousel.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      carousel.removeEventListener('scroll', handleScroll)
    }
  }, [updateSelectedFromScroll])

  return (
    <div
      ref={carouselRef}
      className={`subscription-plan-carousel${plans.length === 1 ? ' single' : ''}${className ? ` ${className}` : ''}`}
      aria-label={ariaLabel}
    >
      {plans.map((plan) => {
        const active = selectedPlan === plan.id
        const busy = busyPlanId === plan.id

        return (
          <article
            key={plan.id}
            ref={(node) => {
              if (node) cardRefs.current.set(plan.id, node)
              else cardRefs.current.delete(plan.id)
            }}
            className={`subscription-plan-card subscription-plan-slide${active ? ' selected' : ''}`}
            onClick={() => onSelectedPlanChange(plan.id)}
          >
            <div className="subscription-plan-badges">
              {plan.badge ? <span className={`subscription-plan-badge${plan.id === 'pro' ? ' pro' : ''}`}>{plan.badge}</span> : null}
              {plan.recommended ? <span className="subscription-plan-badge recommended">RECOMMENDED</span> : null}
              {cycle === 'yearly' && plan.yearlyDiscountNote ? <span className="subscription-plan-badge save">{plan.yearlyDiscountNote}</span> : null}
            </div>

            <div className="subscription-plan-top">
              <h2>{plan.label}</h2>
              <p>{plan.subtitle}</p>
            </div>

            <div className="subscription-price-row">
              <span className="subscription-price">{plan.price[cycle]}</span>
              <span className="subscription-price-suffix">{plan.suffix[cycle]}</span>
            </div>

            {plan.helper ? <p className="subscription-plan-helper">{plan.helper}</p> : null}

            <div className="subscription-plan-divider" />

            <button
              type="button"
              className={`btn btn-full subscription-plan-btn${active ? ' btn-primary' : ' btn-secondary'}`}
              onClick={(event) => {
                event.stopPropagation()
                void onChoosePlan(plan)
              }}
              disabled={disabled}
            >
              {busy ? getBusyLabel?.(plan) ?? 'Saving...' : getCtaLabel(plan)}
            </button>

            <div className="subscription-plan-divider" />

            <p className="subscription-highlights-title">Plan highlights:</p>
            <div className="stack gap-6 subscription-feature-list">
              {plan.features.map((feature) => (
                <p key={feature} className="subscription-feature-item">
                  <span className="subscription-feature-icon">
                    <Check size={10} />
                  </span>
                  <span>{feature}</span>
                </p>
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}
