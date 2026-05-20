import { PUBLIC_VAPID_PUBLIC_KEY } from '$env/static/public'

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push не поддерживается в этом браузере')
        return null
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
        console.warn('Пользователь отклонил уведомления')
        return null
    }

    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    const existing = await reg.pushManager.getSubscription()
    if (existing) return existing

    const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_PUBLIC_KEY),
    })

    return subscription
}

export async function unsubscribeFromPush(): Promise<void> {
    const reg = await navigator.serviceWorker.getRegistration()
    const subscription = await reg?.pushManager.getSubscription()
    await subscription?.unsubscribe()
}
