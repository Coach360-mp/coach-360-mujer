import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export async function solicitarPermisoNotificaciones(userId, supabase) {
  try {
    if (!('Notification' in window)) return null
    if (!('serviceWorker' in navigator)) return null

    const permiso = await Notification.requestPermission()
    if (permiso !== 'granted') return null

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    const messaging = getMessaging(app)

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    })

    if (token && userId && supabase) {
      await supabase.from('fcm_tokens').upsert({
        user_id: userId,
        token,
        plataforma: 'web',
        activo: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,token' })
    }

    return token
  } catch (err) {
    console.error('Error FCM:', err)
    return null
  }
}

export function escucharNotificaciones(callback) {
  try {
    const messaging = getMessaging(app)
    return onMessage(messaging, (payload) => {
      callback(payload)
    })
  } catch (err) {
    console.error('Error escuchando FCM:', err)
    return () => {}
  }
}
