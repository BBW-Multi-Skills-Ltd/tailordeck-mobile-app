import { Clipboard } from '@capacitor/clipboard'
import { Capacitor } from '@capacitor/core'

export async function readClipboardText(): Promise<string> {
  if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Clipboard')) {
    const result = await Clipboard.read()
    return result.value ?? ''
  }

  if (navigator.clipboard?.readText) {
    return navigator.clipboard.readText()
  }

  return ''
}
