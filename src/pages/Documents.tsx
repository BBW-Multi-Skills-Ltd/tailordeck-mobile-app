import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import InvoiceReceiptPanel from '../components/settings/InvoiceReceiptPanel'
import { useSettingsPage } from '../components/settings/useSettingsPage'
import PageHeader from '../components/shared/PageHeader'
import { useFeatureAccess } from '../hooks/useFeatureAccess'
import { featureKeys } from '../lib/features'

export default function Documents() {
  const navigate = useNavigate()
  const { actions, state } = useSettingsPage()
  const setupAccess = useFeatureAccess(featureKeys.fullDocumentSetup)
  const locked = setupAccess.data === false

  return (
    <section className="section stack gap-16">
      <PageHeader
        title="Invoice & Receipt"
        centered
        leading={
          <Link to="/more" className="btn btn-ghost btn-icon" aria-label="Back to more">
            <ArrowLeft size={18} />
          </Link>
        }
      />

      <InvoiceReceiptPanel
        locked={locked}
        settings={state.settings}
        saved={state.savedSection === 'Invoice & Receipt Setup' && Boolean(state.savedTick)}
        onFileUpload={(field, event) => actions.uploadSettingsImage(field, event)}
        onUpgrade={() => navigate('/settings/subscription')}
        onToggleBrandDetail={actions.toggleBrandDetail}
        onSave={() => actions.markSaved('Invoice & Receipt Setup')}
      />
    </section>
  )
}
