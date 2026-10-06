import { SUPPORT_EMAIL } from '../lib/webAccess'

const deletionEmailHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Delete my TailorDeck account')}&body=${encodeURIComponent(
  'Please delete my TailorDeck account.\n\nAccount email: \nShop name (optional): \n',
)}`

/** Public account-deletion page (required by Google Play for apps with accounts). */
export default function DeleteAccountPage() {
  return (
    <article className="mk-doc">
      <h1>Delete your TailorDeck account</h1>
      <p className="mk-lead">
        You can delete your TailorDeck account and its data at any time, from the app or by email.
      </p>

      <h2>Option 1: in the app</h2>
      <ol>
        <li>Open TailorDeck and sign in.</li>
        <li>
          Go to <strong>More → Settings → Account &amp; Security</strong>.
        </li>
        <li>
          Tap <strong>Delete Account Permanently</strong>, type <strong>DELETE</strong> and tap <strong>Request deletion</strong>.
        </li>
      </ol>

      <h2>Option 2: by email</h2>
      <p>
        If you cannot open the app, email <a href={deletionEmailHref}>{SUPPORT_EMAIL}</a> from the email address you
        signed up with, with the subject <strong>“Delete my TailorDeck account”</strong>. We confirm the request with you
        before deleting anything.
      </p>

      <h2>What happens</h2>
      <ul>
        <li>Your account is locked straight away and permanently deleted after <strong>14 days</strong>. Sign in during that time if you want to keep it.</li>
        <li>
          After 14 days we delete your shop profile, clients, jobs, measurements, photos, documents, logo, signature and
          settings.
        </li>
        <li>
          A paid plan is cancelled in Google Play so you are not charged again. Payments already made are not refunded.
        </li>
        <li>
          We may keep a minimal record that the account was deleted (no personal details) for security and legal
          reasons.
        </li>
      </ul>
    </article>
  )
}
