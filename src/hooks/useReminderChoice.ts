import { useState } from 'react'
import { findReminderPreset, REMINDER_PRESETS } from '../lib/jobReminder'
import type { Reminder, ReminderSelection, ReminderUnit } from '../lib/reminderTypes'

export type ReminderPreset = (typeof REMINDER_PRESETS)[number]

/**
 * Pill state for "remind me before" pickers (new job Step 4, Settings default reminder).
 * Presets such as "10 min before" are stored as a custom reminder, so they need no extra reminder types.
 */
export function useReminderChoice({
  reminder,
  customValue,
  customUnit,
  onReminderChange,
  onCustomValueChange,
  onCustomUnitChange,
}: {
  reminder: ReminderSelection
  customValue: string
  customUnit: ReminderUnit
  onReminderChange: (value: Reminder) => void
  onCustomValueChange: (value: string) => void
  onCustomUnitChange: (value: ReminderUnit) => void
}) {
  const matchedPreset = reminder === 'custom' ? findReminderPreset(customValue, customUnit) : null
  // "Custom" stays open while the user types, even if the value happens to equal a preset.
  const [customOpen, setCustomOpen] = useState(() => reminder === 'custom' && !matchedPreset)
  const customActive = reminder === 'custom' && (customOpen || !matchedPreset)

  return {
    customActive,
    isPresetActive: (preset: ReminderPreset) => !customActive && matchedPreset === preset,
    chooseOption(value: Reminder) {
      setCustomOpen(false)
      onReminderChange(value)
    },
    choosePreset(preset: ReminderPreset) {
      setCustomOpen(false)
      onReminderChange('custom')
      onCustomValueChange(preset.value)
      onCustomUnitChange(preset.unit)
    },
    chooseCustom() {
      setCustomOpen(true)
      onReminderChange('custom')
    },
  }
}

export const REMINDER_OPTIONS_BEFORE_PRESETS: Reminder[] = ['none']
export const REMINDER_OPTIONS_AFTER_PRESETS: Reminder[] = ['1 day before', '3 days before', '1 week before']
