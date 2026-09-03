import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSubscriptionQuery } from '../../hooks/useFeatureAccess'
import { getEffectiveSubscriptionPlan, getTrialEnd } from '../../services/subscriptionService'

const NOTICE_KEY_PREFIX = 'tailordeck-trial-expired-notice'

export default function TrialExpiredNotice() {
  const location = useLocation()
  const subscriptionQuery = useSubscriptionQuery()
  const [now] = useState(() => Date.now())
  const subscription = subscriptionQuery.data
  const noticeKey = useMemo(() => {
    if (!subscription?.user_id) return ''
    const freeStart = subscription.free_started_at ?? 'free'
    return `${NOTICE_KEY_PREFIX}:${subscription.user_id}:${freeStart}`
  }, [subscription?.free_started_at, subscription?.user_id])

  const shouldShow = useMemo(() => {
    if (!subscription || !noticeKey) return false
    if (location.pathname.startsWith('/billing/callback')) return false
    const trialEnd = getTrialEnd(subscription)
    if (!trialEnd || new Date(trialEnd).getTime() > now) return false
    return getEffectiveSubscriptionPlan(subscription, now) === 'free'
  }, [location.pathname, noticeKey, now, subscription])

  if (!shouldShow) return null
  return <TrialExpiredDialog key={noticeKey} noticeKey={noticeKey} />
}

function TrialExpiredDialog({ noticeKey }: { noticeKey: string }) {
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(() => window.localStorage.getItem(noticeKey) === 'seen')

  if (dismissed) return null

  function closeNotice() {
    window.localStorage.setItem(noticeKey, 'seen')
    setDismissed(true)
  }

  function upgradePlan() {
    closeNotice()
    navigate('/settings/subscription')
  }

  return (
    <div className="confirm-overlay trial-expired-overlay" role="dialog" aria-modal="true" aria-label="Free trial ended" onClick={closeNotice}>
      <div className="confirm-modal trial-expired-modal" onClick={(event) => event.stopPropagation()}>
        <h3>Your 14-day full trial has ended</h3>
        <p>You can continue on Free with 3 jobs included, or upgrade to Starter for unlimited job management.</p>
        <div className="row gap-8">
          <button type="button" className="btn btn-secondary flex-1" onClick={closeNotice}>Continue Free</button>
          <button type="button" className="btn btn-primary flex-1" onClick={upgradePlan}>Upgrade Plan</button>
        </div>
      </div>
    </div>
  )
}
