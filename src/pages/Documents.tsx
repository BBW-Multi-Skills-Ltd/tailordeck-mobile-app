import { useNavigate } from 'react-router-dom'
import InvoiceReceiptPanel from '../components/settings/InvoiceReceiptPanel'
import { useSettingsPage } from '../components/settings/useSettingsPage'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'
import { useFeatureAccess } from '../hooks/useFeatureAccess'
import { featureKeys } from '../lib/features'

export default function Documents() {
  const navigate = useNavigate()
  const { actions, state } = useSettingsPage()
  const setupAccess = useFeatureAccess(featureKeys.fullDocumentSetup)
  const locked = setupAccess.data !== true

  return (
    <section className="section stack gap-16">
      <PageHeader
        title="Invoice & Receipt"
        centered
        leading={<HistoryBackButton fallbackTo="/more" />}
      />
      {state.settingsError ? <p className="inline-feedback-error" role="alert">{state.settingsError}</p> : null}

      <InvoiceReceiptPanel
        locked={locked}
        settings={state.settings}
        saved={state.savedSection === 'Invoice & Receipt Setup' && Boolean(state.savedTick)}
        onFileUpload={(field, event) => actions.uploadSettingsImage(field, event)}
        onUpgrade={() => navigate('/settings/subscription')}
        onToggleBrandDetail={actions.toggleBrandDetail}
        onAutoSave={(nextSettings) => void actions.markSaved('Invoice & Receipt Setup', nextSettings)}
      />
    </section>
  )
}
