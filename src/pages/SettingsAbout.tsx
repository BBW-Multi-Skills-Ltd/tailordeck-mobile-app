import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import AboutTailorDeckPanel from '../components/settings/AboutTailorDeckPanel'
import PageHeader from '../components/shared/PageHeader'

export default function SettingsAbout() {
  return (
    <section className="section stack gap-16">
      <PageHeader
        title="About"
        centered
        leading={(
          <Link to="/settings" className="btn btn-ghost btn-icon" aria-label="Back to settings">
            <ArrowLeft size={18} />
          </Link>
        )}
      />

      <AboutTailorDeckPanel />
    </section>
  )
}
