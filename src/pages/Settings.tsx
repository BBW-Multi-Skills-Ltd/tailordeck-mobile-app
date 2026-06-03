import { BellRing, Building2, CircleHelp, Database, LogOut, Moon, Palette, ShieldCheck, Store, Sun, UserRound, WandSparkles } from 'lucide-react'
import AboutTailorDeckPanel from '../components/settings/AboutTailorDeckPanel'
import AccountSecurityPanel from '../components/settings/AccountSecurityPanel'
import BusinessInfoPanel from '../components/settings/BusinessInfoPanel'
import DocumentPreviewSheet from '../components/settings/DocumentPreviewSheet'
import InvoiceReceiptPanel from '../components/settings/InvoiceReceiptPanel'
import ProfileSettingsPanel from '../components/settings/ProfileSettingsPanel'
import RemindersPanel from '../components/settings/RemindersPanel'
import { SettingAccordion, SettingLinkRow } from '../components/settings/SettingsRows'
import ShopPreferencesPanel from '../components/settings/ShopPreferencesPanel'
import { useSettingsPage } from '../components/settings/useSettingsPage'
import type { MaterialQuality, NotificationBellOption, ReminderLead, RingtoneOption } from '../lib/settings'

export default function SettingsPage() {
  const { actions, derived, state } = useSettingsPage()
  const { settings } = state

  return (
    <section className="section stack gap-16">
      <header className="row-between">
        <h1 className="settings-page-title">Settings</h1>
        <button type="button" className="btn btn-ghost btn-icon settings-theme-btn" aria-label={state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={actions.setTheme}>
          {state.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <div className="settings-list">
        <SettingAccordion icon={<UserRound size={20} />} title="My Profile" order={1} panelKey="profile" panel={state.panel} onToggle={actions.handleToggle}>
          <ProfileSettingsPanel
            settings={settings}
            saved={state.savedSection === 'Profile Avatar' && Boolean(state.savedTick)}
            onAvatarUpload={(event) => actions.uploadSettingsImage('avatarUrl', event)}
            onSavePhoto={() => actions.markSaved('Profile Avatar')}
            onEditProfile={actions.openAccountSecurity}
          />
        </SettingAccordion>

        <SettingAccordion icon={<Building2 size={20} />} title="Business Info" order={2} panelKey="business" panel={state.panel} onToggle={actions.handleToggle}>
          <BusinessInfoPanel
            settings={settings}
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
        </SettingAccordion>

        <SettingAccordion icon={<Store size={20} />} title="Shop Preferences" order={3} panelKey="preferences" panel={state.panel} onToggle={actions.handleToggle}>
          <ShopPreferencesPanel
            settings={settings}
            saved={state.savedSection === 'Shop Preferences' && Boolean(state.savedTick)}
            onMeasurementUnitChange={(measurementUnit) => actions.setSettings((prev) => ({ ...prev, preferences: { ...prev.preferences, measurementUnit } }))}
            onMaterialQualityChange={(defaultMaterialQuality: MaterialQuality) => actions.setSettings((prev) => ({ ...prev, preferences: { ...prev.preferences, defaultMaterialQuality } }))}
            onSave={() => actions.markSaved('Shop Preferences')}
          />
        </SettingAccordion>

        <SettingAccordion icon={<Palette size={20} />} title="Invoice & Receipt Setup" order={4} panelKey="brand" panel={state.panel} onToggle={actions.handleToggle}>
          <InvoiceReceiptPanel
            settings={settings}
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
        </SettingAccordion>

        <SettingAccordion icon={<BellRing size={20} />} title="Reminders & Notifications" order={5} panelKey="reminders" panel={state.panel} onToggle={actions.handleToggle}>
          <RemindersPanel
            settings={settings}
            saved={state.savedSection === 'Reminders' && Boolean(state.savedTick)}
            onPushNotificationsChange={(pushNotifications) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, pushNotifications } }))}
            onNotificationBellEnabledChange={(notificationBellEnabled) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, notificationBellEnabled } }))}
            onNotificationBellChange={(notificationBell: NotificationBellOption) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, notificationBell } }))}
            onDefaultReminderChange={(defaultReminder: ReminderLead) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, defaultReminder } }))}
            onRingtoneEnabledChange={(ringtoneEnabled) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, ringtoneEnabled } }))}
            onRingtoneChange={(ringtone: RingtoneOption) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, ringtone } }))}
            onSave={() => actions.markSaved('Reminders')}
          />
        </SettingAccordion>

        <SettingAccordion icon={<ShieldCheck size={20} />} title="Account & Security" tone="danger" order={6} panelKey="security" panel={state.panel} onToggle={actions.handleToggle}>
          <AccountSecurityPanel
            settings={settings}
            profilePhoneLocalPart={derived.profilePhoneLocalPart}
            passwordDraft={state.passwordDraft}
            confirmPasswordDraft={state.confirmPasswordDraft}
            securityFeedback={state.securityFeedback}
            saved={state.savedSection === 'Account & Security' && Boolean(state.savedTick)}
            onFullNameChange={(fullName) => actions.setSettings((prev) => ({ ...prev, profile: { ...prev.profile, fullName } }))}
            onEmailChange={(email) => actions.setSettings((prev) => ({ ...prev, profile: { ...prev.profile, email } }))}
            onPhoneChange={actions.handleProfilePhoneChange}
            onPasswordChange={actions.setPasswordDraft}
            onConfirmPasswordChange={actions.setConfirmPasswordDraft}
            onSave={actions.handleSaveAccountSecurity}
            onDanger={actions.handleSecurityDanger}
          />
        </SettingAccordion>

        <SettingLinkRow icon={<WandSparkles size={20} />} title="Upgrade" subtitle={`Currently on ${settings.subscription.plan === 'free' ? 'Free' : settings.subscription.plan}`} href="/settings/subscription" tone="accent" order={7} />

        <SettingAccordion icon={<CircleHelp size={20} />} title="About TailorDeck" order={8} panelKey="about" panel={state.panel} onToggle={actions.handleToggle}>
          <AboutTailorDeckPanel />
        </SettingAccordion>
      </div>

      <div className="settings-actions">
        <button type="button" className="btn btn-secondary btn-full settings-clear-btn settings-clear-btn-shape" onClick={actions.clearJobHistory}>
          <Database size={18} />
          Clear Job History
        </button>
        <button type="button" className="settings-signout-link" onClick={actions.handleSignOut}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {state.openBrandPreviewSheet ? (
        <DocumentPreviewSheet
          settings={settings}
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
