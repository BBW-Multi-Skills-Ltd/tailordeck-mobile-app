// Alerts for support staff while the support centre is open: a short chime and, when the tab is in the
// background, a desktop notification. Browsers only allow sound and notifications after a click, so staff
// turn alerts on once with the button; the choice is remembered in this browser only.

const PREFERENCE_KEY = 'tailordeck-admin-support-alerts'
const ICON = '/branding/TailorDeck%20app%20logo%20for%20splac%20screen.png'

let audioContext: AudioContext | null = null

export function readAlertsPreference(): boolean {
  try {
    return window.localStorage.getItem(PREFERENCE_KEY) === 'on'
  } catch {
    return false
  }
}

export function saveAlertsPreference(enabled: boolean): void {
  try {
    window.localStorage.setItem(PREFERENCE_KEY, enabled ? 'on' : 'off')
  } catch {
    // Private window or blocked storage: alerts still work until the page is reloaded.
  }
}

/** Must run inside a click (or other user gesture) so the browser lets the page play sound. */
export function unlockAlertSound(): void {
  try {
    audioContext ??= new AudioContext()
    void audioContext.resume()
  } catch {
    audioContext = null
  }
}

export async function requestDesktopAlerts(): Promise<NotificationPermission | 'unsupported'> {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission !== 'default') return Notification.permission
  return Notification.requestPermission()
}

export function desktopAlertsBlocked(): boolean {
  return 'Notification' in window && Notification.permission === 'denied'
}

/** Two short rising tones. Silent if sound was never unlocked in this page. */
export function playAlertSound(): void {
  if (!audioContext || audioContext.state !== 'running') return
  const start = audioContext.currentTime
  ;[880, 1320].forEach((frequency, index) => {
    const oscillator = audioContext!.createOscillator()
    const gain = audioContext!.createGain()
    const at = start + index * 0.18
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(0.25, at + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.16)
    oscillator.connect(gain).connect(audioContext!.destination)
    oscillator.start(at)
    oscillator.stop(at + 0.17)
  })
}

/** Shown only when the tab is in the background; clicking it brings the tab forward and opens the ticket. */
export function showDesktopAlert(title: string, body: string, tag: string, onOpen: () => void): void {
  if (!document.hidden || !('Notification' in window) || Notification.permission !== 'granted') return
  try {
    const notification = new Notification(title, { body, tag, icon: ICON })
    notification.onclick = () => {
      window.focus()
      onOpen()
      notification.close()
    }
  } catch {
    // Some browsers (e.g. Android Chrome) only allow notifications from a service worker; the chime still plays.
  }
}
