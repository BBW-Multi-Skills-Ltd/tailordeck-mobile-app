import { useNavigate } from 'react-router-dom'
import { BarChart3, ClipboardCheck, Users } from 'lucide-react'
import { markOnboardingStage } from '../lib/auth'

export default function OnboardingWelcome() {
  const navigate = useNavigate()

  function handleGetStarted() {
    markOnboardingStage('setup')
    navigate('/onboarding/setup')
  }

  return (
    <main className="page-full onboarding-page onboarding-page-welcome">
      <div className="onboarding-shell onboarding-shell-welcome">
        <div className="onboarding-brand">
          <div className="onboarding-brand-icon" aria-hidden>
            <img src="/Tailor%20deck%20app%20icon%20for%20phone%20screen.png" alt="" className="onboarding-brand-logo" />
          </div>
          <h1 className="onboarding-title">Welcome to TailorDeck</h1>
          <p className="onboarding-subtitle">Your shop, in your pocket</p>
        </div>

        <div className="onboarding-hero-image" aria-hidden>
          <img src="/images/onboarding-tailor-shop-3d.svg" alt="" />
        </div>

        <section className="onboarding-card onboarding-card-plain">
          <article className="onboarding-feature">
            <span className="onboarding-feature-icon">
              <Users size={16} />
            </span>
            <div>
              <p className="onboarding-feature-title">Manage Clients</p>
              <p className="onboarding-feature-text">Keep track of customer details and preferences</p>
            </div>
          </article>
          <article className="onboarding-feature">
            <span className="onboarding-feature-icon">
              <ClipboardCheck size={16} />
            </span>
            <div>
              <p className="onboarding-feature-title">Track Jobs</p>
              <p className="onboarding-feature-text">Monitor order progress from start to finish</p>
            </div>
          </article>
          <article className="onboarding-feature">
            <span className="onboarding-feature-icon">
              <BarChart3 size={16} />
            </span>
            <div>
              <p className="onboarding-feature-title">Grow Business</p>
              <p className="onboarding-feature-text">Insights and tools to expand your operations</p>
            </div>
          </article>
        </section>

        <button type="button" className="btn btn-primary btn-full onboarding-primary-btn" onClick={handleGetStarted}>
          Get Started
        </button>
      </div>
    </main>
  )
}
