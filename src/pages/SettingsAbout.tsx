import AboutTailorDeckPanel from '../components/settings/AboutTailorDeckPanel'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'

export default function SettingsAbout() {
  return (
    <section className="section stack gap-16">
      <PageHeader
        title="About"
        centered
        leading={<HistoryBackButton fallbackTo="/settings" />}
      />

      <AboutTailorDeckPanel />
    </section>
  )
}
