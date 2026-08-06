import { ShieldCheck } from 'lucide-react'

type PaymentTrustNoteProps = {
  className?: string
}

export default function PaymentTrustNote({ className = '' }: PaymentTrustNoteProps) {
  return (
    <p className={`payment-trust-note${className ? ` ${className}` : ''}`}>
      <ShieldCheck size={15} aria-hidden />
      <span>Secure payment handled by BBW Tech Innovations, the company behind TailorDeck.</span>
    </p>
  )
}
