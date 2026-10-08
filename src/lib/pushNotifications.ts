import { Capacitor, type PluginListenerHandle } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { supabase } from './supabase'

// Firebase push notifications (Android app only), used for support chat replies.
// The device token is saved for the signed-in user (register_push_token) and removed on sign-out.

const TOKEN_STORAGE_KEY = 'tailordeck-push-token'
const SUPPORT_CHANNEL_ID = 'support'

let listenersReady = false
let registering = false

function isPushSupported(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('PushNotifications')
}

function storedToken(): string {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function storeToken(token: string): void {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
    else localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // Storage unavailable: the token is re-registered on the next start anyway.
  }
}

async function ensureListeners(): Promise<void> {
  if (listenersReady) return
  listenersReady = true
  await PushNotifications.createChannel({
    id: SUPPORT_CHANNEL_ID,
    name: 'Support replies',
    description: 'Replies from TailorDeck support',
    importance: 4,
    visibility: 1,
  }).catch(() => undefined)
  await PushNotifications.addListener('registration', ({ value }) => {
    storeToken(value)
    void supabase.rpc('register_push_token', { device_token: value, device_platform: Capacitor.getPlatform() }).then(({ error }) => {
      if (error) console.warn('Unable to save push token:', error.message)
    })
  })
  await PushNotifications.addListener('registrationError', (error) => {
    console.warn('Push registration failed:', error.error)
  })
}

async function register(): Promise<void> {
  if (registering) return
  registering = true
  try {
    await ensureListeners()
    await PushNotifications.register()
  } finally {
    registering = false
  }
}

/** On app start (signed in): register silently if notifications are already allowed. */
export async function registerPushIfPermitted(): Promise<void> {
  if (!isPushSupported()) return
  const permission = await PushNotifications.checkPermissions()
  if (permission.receive === 'granted') await register()
}

/** After the user contacts support: ask for permission so replies can reach them. */
export async function requestSupportPushPermission(): Promise<void> {
  if (!isPushSupported()) return
  try {
    let permission = await PushNotifications.checkPermissions()
    if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
      permission = await PushNotifications.requestPermissions()
    }
    if (permission.receive === 'granted') await register()
  } catch (error) {
    console.warn('Unable to enable push notifications:', error)
  }
}

/** Before sign-out: stop pushes for this account on this device. */
export async function unregisterPushToken(): Promise<void> {
  const token = storedToken()
  if (!token) return
  storeToken('')
  await supabase.rpc('unregister_push_token', { device_token: token }).then(
    () => undefined,
    () => undefined,
  )
}

type PushHandlers = {
  /** A notification was tapped: open its link. */
  onOpen: (url: string) => void
  /** A push arrived while the app was open. */
  onReceived: () => void
}

export function registerPushHandlers(handlers: PushHandlers): () => void {
  if (!isPushSupported()) return () => undefined
  const handles: PluginListenerHandle[] = []
  void PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const url = (action.notification.data as { url?: string } | undefined)?.url
    if (url && url.startsWith('/')) handlers.onOpen(url)
  }).then((handle) => handles.push(handle))
  void PushNotifications.addListener('pushNotificationReceived', () => handlers.onReceived()).then((handle) => handles.push(handle))
  return () => {
    for (const handle of handles) void handle.remove()
  }
}
