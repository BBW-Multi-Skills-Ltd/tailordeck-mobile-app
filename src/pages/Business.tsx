import { CheckCircle2, Circle } from 'lucide-react'
import BusinessInfoPanel from '../components/settings/BusinessInfoPanel'
import { useSettingsPage } from '../components/settings/useSettingsPage'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'

export default function Business() {
  const { actions, derived, state } = useSettingsPage()
  const checklist = buildBusinessSetupChecklist(state.settings)
  const completeCount = checklist.filter((item) => item.complete).length
  const progress = Math.round((completeCount / checklist.length) * 100)

  return (
    <section className="section stack gap-16">
      <PageHeader
        title="Business & Shop"
        centered
        leading={<HistoryBackButton fallbackTo="/more" />}
      />

      <BusinessSetupProgress completeCount={completeCount} items={checklist} progress={progress} />
      {state.settingsError ? <p className="inline-feedback-error" role="alert">{state.settingsError}</p> : null}

      <div className="stack gap-8">
        <p className="more-group-title">Business Info</p>
        <BusinessInfoPanel
          settings={state.settings}
          businessPhoneLocalPart={derived.businessPhoneLocalPart}
          websiteLocalPart={derived.websiteLocalPart}
          socialPlatform={state.socialPlatform}
          socialHandleInput={state.socialHandleInput}
          saved={state.savedSection === 'Business Info' && Boolean(state.savedTick)}
          onShopNameChange={(shopName) => actions.setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, shopName } }))}
          onBusinessPhoneChange={actions.handleBusinessPhoneChange}
          onBusinessEmailChange={(businessEmail) => actions.setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, businessEmail } }))}
          onCacRegistrationNumberChange={(cacRegistrationNumber) => actions.setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, cacRegistrationNumber } }))}
          onWebsiteChange={actions.handleWebsiteChange}
          onSocialPlatformChange={actions.setSocialPlatform}
          onSocialHandleInputChange={actions.setSocialHandleInput}
          onAddSocialHandle={actions.addSocialHandle}
          onRemoveSocialHandle={actions.removeSocialHandle}
          onShopAddressChange={(shopAddress) => actions.setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, shopAddress } }))}
          onSave={() => actions.markSaved('Business Info')}
        />
      </div>
    </section>
  )
}

function buildBusinessSetupChecklist(settings: ReturnType<typeof useSettingsPage>['state']['settings']) {
  return [
    { label: 'Shop name', complete: Boolean(settings.businessInfo.shopName.trim()) },
    { label: 'Phone', complete: Boolean(settings.businessInfo.businessPhone.replace(/\D/g, '').length > 3) },
    { label: 'Email', complete: Boolean(settings.businessInfo.businessEmail.trim()) },
    { label: 'Website', complete: Boolean(settings.businessInfo.website.replace(/^https?:\/\//, '').trim()) },
    { label: 'CAC / RC', complete: Boolean(settings.businessInfo.cacRegistrationNumber.trim()) },
    { label: 'Social', complete: settings.businessInfo.socialHandles.length > 0 },
    { label: 'Address', complete: Boolean(settings.businessInfo.shopAddress.trim()) },
  ]
}

function BusinessSetupProgress({
  completeCount,
  items,
  progress,
}: {
  completeCount: number
  items: Array<{ label: string; complete: boolean }>
  progress: number
}) {
  return (
    <section className="settings-document-progress">
      <div className="row-between">
        <div>
          <p className="settings-document-progress-kicker">Business setup</p>
          <h3>{progress}% complete</h3>
        </div>
        <span className="settings-document-progress-count">
          {completeCount}/{items.length}
        </span>
      </div>
      <div className="settings-document-progress-track" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="settings-document-checklist">
        {items.map((item) => (
          <span key={item.label} className={`settings-document-check${item.complete ? ' complete' : ''}`}>
            {item.complete ? <CheckCircle2 size={13} /> : <Circle size={13} />}
            {item.label}
          </span>
        ))}
      </div>
    </section>
  )
}
