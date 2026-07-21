import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import InvoiceReceiptPanel from '../components/settings/InvoiceReceiptPanel'
import { useSettingsPage } from '../components/settings/useSettingsPage'
import PageHeader from '../components/shared/PageHeader'

export default function Documents() {
  const { actions, state } = useSettingsPage()

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
        settings={state.settings}
        saved={state.savedSection === 'Invoice & Receipt Setup' && Boolean(state.savedTick)}
        onFileUpload={(field, event) => actions.uploadSettingsImage(field, event)}
        onToggleBrandDetail={actions.toggleBrandDetail}
        onSave={() => actions.markSaved('Invoice & Receipt Setup')}
      />
    </section>
  )
}
