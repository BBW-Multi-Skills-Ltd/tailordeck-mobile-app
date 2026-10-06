import { describe, expect, it } from 'vitest'
import { findReminderPreset, isCustomReminderValid, REMINDER_PRESETS, reminderToDbFields } from '../jobReminder'

describe('reminder presets', () => {
  it('stores presets as valid custom reminders', () => {
    for (const preset of REMINDER_PRESETS) {
      expect(isCustomReminderValid(preset.value, preset.unit)).toBe(true)
    }
    expect(reminderToDbFields('custom', '10', 'minutes')).toEqual({
      customReminderValue: 10,
      customReminderUnit: 'minutes',
      customReminderMinutes: 10,
      reminderLabel: '10 minutes before',
    })
  })

  it('matches presets by total minutes', () => {
    expect(findReminderPreset('15', 'minutes')?.label).toBe('15 min before')
    expect(findReminderPreset('60', 'minutes')?.label).toBe('1 hour before')
    expect(findReminderPreset('45', 'minutes')).toBeNull()
    expect(findReminderPreset('', 'minutes')).toBeNull()
  })
})
