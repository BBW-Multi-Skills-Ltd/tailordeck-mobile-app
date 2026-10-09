import { useEffect, useState, type FormEvent } from 'react'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { friendlyAuthError } from '../lib/authErrors'
import { supabase } from '../lib/supabase'
import type { TwoStepState } from './useAdminSession'

const CODE_LENGTH = 6

type Enrollment = { factorId: string; qrCode: string; secret: string }

/**
 * Second step of admin sign-in (TOTP from an authenticator app). First time: scan a QR code to set it up.
 * After that: enter the 6-digit code. Verifying moves the session to aal2, which the database and the
 * admin Edge Functions require (public.is_admin, _shared/supabase.ts hasAdminRole).
 */
export default function AdminTwoStep({ mode, email, onSignOut }: { mode: Exclude<TwoStepState, 'verified'>; email: string; onSignOut: () => void }) {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // First time: create the authenticator entry (removing any half-finished one from an earlier attempt).
  useEffect(() => {
    if (mode !== 'enroll') return undefined
    let active = true
    void (async () => {
      try {
        const { data: factors, error: listError } = await supabase.auth.mfa.listFactors()
        if (listError) throw listError
        for (const factor of factors.all.filter((item) => item.factor_type === 'totp' && item.status === 'unverified')) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id })
        }
        const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'TailorDeck Admin' })
        if (enrollError) throw enrollError
        if (active) setEnrollment({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret })
      } catch (caught) {
        if (active) setError(friendlyAuthError(caught, 'Unable to start two-step setup. Refresh the page to try again.'))
      }
    })()
    return () => {
      active = false
    }
  }, [mode])

  async function verify(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      let factorId = enrollment?.factorId
      if (!factorId) {
        const { data, error: listError } = await supabase.auth.mfa.listFactors()
        if (listError) throw listError
        factorId = data.totp[0]?.id
      }
      if (!factorId) throw new Error('No authenticator app is set up for this account.')
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
      if (verifyError) throw verifyError
      // useAdminSession refreshes on MFA_CHALLENGE_VERIFIED and opens the portal.
    } catch (caught) {
      setCode('')
      setError(
        caught instanceof Error && /invalid|expired|code/i.test(caught.message)
          ? 'That code is not correct. Check the app and enter the newest code.'
          : friendlyAuthError(caught, 'Unable to check the code. Please try again.'),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ad-auth">
      <div className="ad-auth-card mk-clay">
        <span className="ad-auth-icon">
          <ShieldCheck size={22} />
        </span>
        <h1>Two-step login</h1>
        {mode === 'enroll' ? (
          <>
            <p className="ad-muted">
              Admin accounts need a second step. Install an authenticator app on your phone (Google Authenticator,
              Microsoft Authenticator or Authy), tap "Add", and scan this code.
            </p>
            {enrollment ? (
              <div className="ad-twostep-setup">
                <img className="ad-twostep-qr" src={enrollment.qrCode} alt="QR code for your authenticator app" width={180} height={180} />
                <p className="ad-muted">Can't scan? Enter this key in the app instead:</p>
                <code className="ad-twostep-secret">{enrollment.secret}</code>
              </div>
            ) : error ? null : (
              <div className="ad-loading" aria-label="Preparing" />
            )}
          </>
        ) : (
          <p className="ad-muted">Open your authenticator app and enter the 6-digit code for TailorDeck ({email}).</p>
        )}

        <form onSubmit={verify} className="ad-form">
          <label className="ad-field">
            <span>{mode === 'enroll' ? 'Code shown in the app' : '6-digit code'}</span>
            <span className="ad-input-wrap">
              <KeyRound size={16} />
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={CODE_LENGTH}
                required
                autoFocus
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
              />
            </span>
          </label>
          {error ? <p className="ad-error" role="alert">{error}</p> : null}
          <button type="submit" className="mk-btn mk-btn-primary ad-full" disabled={busy || code.length !== CODE_LENGTH || (mode === 'enroll' && !enrollment)}>
            {busy ? 'Checking...' : mode === 'enroll' ? 'Finish setup' : 'Continue'}
          </button>
          <button type="button" className="ad-link-btn" onClick={onSignOut}>
            Sign out
          </button>
        </form>
        {mode === 'challenge' ? (
          <p className="ad-muted ad-twostep-help">Lost your phone? Ask the TailorDeck owner to reset your two-step login.</p>
        ) : null}
      </div>
    </div>
  )
}
