import { Check } from 'lucide-react'

export function PasswordStrength({ label, strength }: { label: string; strength: number }) {
  const tone = strength <= 1 ? 'weak' : strength <= 3 ? 'medium' : 'strong'
  return (
    <>
      <div className={`auth-strength ${tone}`}>
        {[1, 2, 3, 4].map((level) => <div key={level} className={`auth-strength-bar${strength >= level ? ' fill' : ''}`} />)}
      </div>
      <p className={`auth-strength-text${strength >= 2 ? ' medium' : ''}${strength >= 4 ? ' strong' : ''}`}>{label}</p>
    </>
  )
}

export function PasswordChecklist({ checks }: { checks: readonly { key: string; label: string; passed: boolean }[] }) {
  return (
    <div className="password-checklist" aria-label="Password requirements">
      {checks.map((check) => (
        <span key={check.key} className={`password-check${check.passed ? ' passed' : ''}`}>
          <Check size={12} />
          {check.label}
        </span>
      ))}
    </div>
  )
}
