import { requiredEnv } from './env.ts'

// Transactional email through Resend: escaping, the TailorDeck layout, and sending.

const DEFAULT_FROM = 'TailorDeck Support <noreply@tailordeck.app>'
const DEFAULT_SUPPORT_INBOX = 'support@tailordeck.app'
const BRAND_FOOTER = 'TailorDeck is a product of BBW Tech Innovations, a technology division under BBW Multi-Skills Ltd.'

export function htmlEscape(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char] ?? char)
}

/** Escaped text with line breaks kept. */
export function paragraphs(value: string): string {
  return htmlEscape(value).replace(/\n/g, '<br />')
}

export function supportInbox(): string {
  return Deno.env.get('SUPPORT_TO_EMAIL') || DEFAULT_SUPPORT_INBOX
}

/** TailorDeck email layout. `inner` must already be escaped HTML. */
export function emailShell(title: string, inner: string, footerNote = ''): string {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2f241f;max-width:560px;margin:0 auto;padding:24px;">
      <h2 style="color:#7B1E37;margin:0 0 12px;">${htmlEscape(title)}</h2>
      ${inner}
      <p style="font-size:12px;color:#8B7A70;margin-top:24px;">${BRAND_FOOTER}</p>
      ${footerNote ? `<p style="font-size:12px;color:#8B7A70;margin-top:12px;">${htmlEscape(footerNote)}</p>` : ''}
    </div>`
}

export type SendEmailResult = { ok: boolean; status: number; detail: string }

/** Sends one email. Never throws for Resend rejections; check `ok` (network errors still throw). */
export async function sendEmail(params: { to: string; subject: string; html: string; replyTo?: string }): Promise<SendEmailResult> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${requiredEnv('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('RESEND_FROM_EMAIL') || DEFAULT_FROM,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      ...(params.replyTo ? { reply_to: params.replyTo } : {}),
    }),
  })
  const detail = response.ok ? '' : (await response.text().catch(() => '')).slice(0, 500)
  if (!response.ok) console.error('Resend email failed:', response.status, detail)
  return { ok: response.ok, status: response.status, detail }
}
