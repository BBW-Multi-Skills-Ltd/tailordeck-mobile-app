import { PlayButton } from './MarketingLayout'

/** Shown for old email links (password reset, etc.) opened in a browser: TailorDeck accounts are managed in the app. */
export default function OpenInAppPage() {
  return (
    <article className="mk-doc mk-doc-center">
      <h1>Continue in the TailorDeck app</h1>
      <p className="mk-lead">TailorDeck accounts are managed in the Android app.</p>
      <p>
        To reset your password, open TailorDeck, tap <strong>Sign in → Forgot password?</strong>, and enter the code we
        email you.
      </p>
      <p>Don&apos;t have the app yet?</p>
      <PlayButton />
    </article>
  )
}
