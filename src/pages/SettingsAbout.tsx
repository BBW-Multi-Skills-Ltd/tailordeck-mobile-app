import AboutTailorDeckPanel from '../components/settings/AboutTailorDeckPanel'
import PageHeader from '../components/shared/PageHeader'

export default function SettingsAbout() {
  return (
    <section className="section stack gap-16">
      <PageHeader title="About" centered />

      <article className="clay-card settings-standalone-card">
        <AboutTailorDeckPanel />
      </article>
    </section>
  )
}
