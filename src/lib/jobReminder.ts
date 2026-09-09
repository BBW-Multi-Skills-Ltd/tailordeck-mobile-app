import type { Reminder, ReminderSelection, ReminderUnit } from '../components/newjob/newJobTypes'

export const CUSTOM_REMINDER_MINUTES_MIN = 10
export const CUSTOM_REMINDER_MINUTES_MAX = 60 * 24 * 30

const unitMinutes: Record<ReminderUnit, number> = {
  minutes: 1,
  hours: 60,
  days: 60 * 24,
  weeks: 60 * 24 * 7,
}

export function getReminderMinutes(reminder: ReminderSelection, customValue?: string, customUnit?: ReminderUnit): number | null {
  if (reminder === '1 day before') return 60 * 24
  if (reminder === '3 days before') return 60 * 24 * 3
  if (reminder === '1 week before') return 60 * 24 * 7
  if (reminder !== 'custom') return null

  const value = Number(customValue)
  if (!Number.isFinite(value) || !customUnit) return null
  return Math.round(value * unitMinutes[customUnit])
}

export function getReminderLabel(reminder: ReminderSelection, customValue?: string, customUnit?: ReminderUnit): string {
  if (!reminder) return 'Choose option'
  if (reminder === 'none') return 'No reminder'
  if (reminder !== 'custom') return reminder

  const value = Number(customValue)
  if (!Number.isFinite(value) || value <= 0 || !customUnit) return 'Custom reminder'
  const singularUnit = customUnit.endsWith('s') && value === 1 ? customUnit.slice(0, -1) : customUnit
  return `${value} ${singularUnit} before`
}

export function isCustomReminderValid(customValue: string, customUnit: ReminderUnit): boolean {
  const minutes = getReminderMinutes('custom', customValue, customUnit)
  return minutes !== null && minutes >= CUSTOM_REMINDER_MINUTES_MIN && minutes <= CUSTOM_REMINDER_MINUTES_MAX
}

export function cleanReminderValue(value: string): string {
  return value.replace(/\D/g, '').slice(0, 3)
}

export function reminderToDbFields(reminder: Reminder, customValue?: string, customUnit?: ReminderUnit) {
  if (reminder !== 'custom') {
    return {
      customReminderValue: null,
      customReminderUnit: null,
      customReminderMinutes: null,
      reminderLabel: getReminderLabel(reminder),
    }
  }

  const customReminderUnit = customUnit ?? 'hours'
  const customReminderMinutes = getReminderMinutes(reminder, customValue, customReminderUnit)

  return {
    customReminderValue: customReminderMinutes ? Number(customValue) : null,
    customReminderUnit: customReminderMinutes ? customReminderUnit : null,
    customReminderMinutes,
    reminderLabel: getReminderLabel(reminder, customValue, customReminderUnit),
  }
}
