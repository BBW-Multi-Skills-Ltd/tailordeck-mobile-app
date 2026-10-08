export type SettingsPanel = 'profile' | 'security' | 'preferences' | 'reminders' | 'business' | 'brand' | 'about' | null

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      className={`settings-toggle${checked ? ' active' : ''}`}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="settings-toggle-knob" />
    </button>
  )
}
