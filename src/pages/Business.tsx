import BusinessInfoPanel from '../components/settings/BusinessInfoPanel'
import ShopPreferencesPanel from '../components/settings/ShopPreferencesPanel'
import { useSettingsPage } from '../components/settings/useSettingsPage'
import PageHeader from '../components/shared/PageHeader'
import type { MaterialQuality } from '../lib/settings'

export default function Business() {
  const { actions, derived, state } = useSettingsPage()

  return (
    <section className="section stack gap-16">
      <PageHeader title="Business & Shop" centered />

      <div className="stack gap-8">
        <p className="more-group-title">Business Info</p>
        <article className="clay-card settings-standalone-card">
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
            onWebsiteChange={actions.handleWebsiteChange}
            onSocialPlatformChange={actions.setSocialPlatform}
            onSocialHandleInputChange={actions.setSocialHandleInput}
            onAddSocialHandle={actions.addSocialHandle}
            onRemoveSocialHandle={actions.removeSocialHandle}
            onShopAddressChange={(shopAddress) => actions.setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, shopAddress } }))}
            onSave={() => actions.markSaved('Business Info')}
          />
        </article>
      </div>

      <div className="stack gap-8">
        <p className="more-group-title">Shop Preferences</p>
        <article className="clay-card settings-standalone-card">
          <ShopPreferencesPanel
            settings={state.settings}
            saved={state.savedSection === 'Shop Preferences' && Boolean(state.savedTick)}
            onMeasurementUnitChange={(measurementUnit) => actions.setSettings((prev) => ({ ...prev, preferences: { ...prev.preferences, measurementUnit } }))}
            onMaterialQualityChange={(defaultMaterialQuality: MaterialQuality) => actions.setSettings((prev) => ({ ...prev, preferences: { ...prev.preferences, defaultMaterialQuality } }))}
            onSave={() => actions.markSaved('Shop Preferences')}
          />
        </article>
      </div>
    </section>
  )
}
