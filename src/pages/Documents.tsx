import DocumentPreviewSheet from '../components/settings/DocumentPreviewSheet'
import InvoiceReceiptPanel from '../components/settings/InvoiceReceiptPanel'
import { useSettingsPage } from '../components/settings/useSettingsPage'
import PageHeader from '../components/shared/PageHeader'

export default function Documents() {
  const { actions, state } = useSettingsPage()

  return (
    <section className="section stack gap-16">
      <PageHeader title="Invoice & Receipt" centered />

      <article className="clay-card settings-standalone-card">
        <InvoiceReceiptPanel
          settings={state.settings}
          openColorPicker={state.openColorPicker}
          invoicePreviewGenerated={state.invoicePreviewGenerated}
          saved={state.savedSection === 'Invoice & Receipt Setup' && Boolean(state.savedTick)}
          onColorPickerToggle={(index) => actions.setOpenColorPicker((prev) => (prev === index ? null : index))}
          onColorChange={actions.updateColor}
          onFileUpload={(field, event) => actions.uploadSettingsImage(field, event)}
          onToggleBrandDetail={actions.toggleBrandDetail}
          onGeneratePreview={() => {
            actions.setGeneratedPreviewKind('invoice')
            actions.setInvoicePreviewGenerated(true)
            actions.setOpenBrandPreviewSheet(true)
          }}
          onSave={() => actions.markSaved('Invoice & Receipt Setup')}
        />
      </article>

      {state.openBrandPreviewSheet ? (
        <DocumentPreviewSheet
          settings={state.settings}
          previewKind={state.generatedPreviewKind}
          onPreviewKindChange={actions.setGeneratedPreviewKind}
          onClose={() => actions.setOpenBrandPreviewSheet(false)}
          onEdit={() => {
            actions.setInvoicePreviewGenerated(false)
            actions.setOpenBrandPreviewSheet(false)
          }}
          onSave={() => {
            actions.markSaved('Invoice & Receipt Setup')
            actions.setOpenBrandPreviewSheet(false)
          }}
        />
      ) : null}
    </section>
  )
}
