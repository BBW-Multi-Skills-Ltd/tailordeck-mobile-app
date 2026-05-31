import type { MaterialQuality, TailorSettings } from '../../lib/settings'

type ShopPreferencesPanelProps = {
  settings: TailorSettings
  saved: boolean
  onMeasurementUnitChange: (value: TailorSettings['preferences']['measurementUnit']) => void
  onMaterialQualityChange: (value: MaterialQuality) => void
  onSave: () => void
}

export default function ShopPreferencesPanel({ settings, saved, onMeasurementUnitChange, onMaterialQualityChange, onSave }: ShopPreferencesPanelProps) {
  return (
    <div className="stack settings-pref-form">
      <div className="stack settings-pref-group">
        <p className="settings-pref-label">Default Measurement Unit</p>
        <p className="settings-help-text">Used for measurement entry across jobs and client profiles.</p>
        <div className="settings-radio-list">
          {(['cm', 'inches'] as const).map((unit) => (
            <button key={unit} type="button" className={`settings-radio-option${settings.preferences.measurementUnit === unit ? ' active' : ''}`} onClick={() => onMeasurementUnitChange(unit)}>
              <span className="settings-radio-indicator" />
              <span className="settings-radio-title">{unit === 'cm' ? 'Centimeters' : 'Inches'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="input-group settings-pref-group">
        <p className="settings-pref-label">Default Material Quality</p>
        <p className="settings-help-text">Default quality preselected when creating new jobs.</p>
        <div className="settings-radio-list">
          {(['Normal', 'Original', 'Fake', 'High Standard'] as MaterialQuality[]).map((quality) => (
            <button key={quality} type="button" className={`settings-radio-option${settings.preferences.defaultMaterialQuality === quality ? ' active' : ''}`} onClick={() => onMaterialQualityChange(quality)}>
              <span className="settings-radio-indicator" />
              <span className="settings-radio-title">{quality}</span>
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="btn btn-primary settings-panel-save-btn" onClick={onSave}>
        Save Shop Preferences
      </button>
      {saved ? <p className="text-sm text-success">Shop Preferences saved.</p> : null}
    </div>
  )
}
