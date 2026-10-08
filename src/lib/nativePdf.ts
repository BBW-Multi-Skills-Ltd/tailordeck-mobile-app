import { Capacitor } from '@capacitor/core'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

// PDFs on the Android app. The WebView cannot download blob links or attach files to a wa.me link, so the
// file is written to the device and handed to Android: the share sheet (WhatsApp, Gmail, Drive...) to send
// it, or the Documents folder to keep it.

export function isNativePdfSupported(): boolean {
  return Capacitor.isNativePlatform()
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(new Error('Could not read the PDF.'))
    reader.readAsDataURL(blob)
  })
}

function isShareCancelled(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /cancel/i.test(message)
}

/** Opens the share sheet with the PDF attached and `text` as the message. Returns false if the user backed out. */
export async function sharePdf(blob: Blob, fileName: string, text: string, title: string): Promise<boolean> {
  const { uri } = await Filesystem.writeFile({
    path: `shared-documents/${fileName}`,
    data: await blobToBase64(blob),
    directory: Directory.Cache,
    recursive: true,
  })
  try {
    await Share.share({ title, text, files: [uri], dialogTitle: title })
    return true
  } catch (error) {
    if (isShareCancelled(error)) return false
    throw error
  }
}

/** Saves the PDF to Documents/TailorDeck. Older Android versions that refuse it get the share sheet instead. */
export async function savePdf(blob: Blob, fileName: string): Promise<'saved' | 'shared' | 'cancelled'> {
  const data = await blobToBase64(blob)
  try {
    await Filesystem.writeFile({ path: `TailorDeck/${fileName}`, data, directory: Directory.Documents, recursive: true })
    return 'saved'
  } catch {
    return (await sharePdf(blob, fileName, fileName, 'Save PDF')) ? 'shared' : 'cancelled'
  }
}
