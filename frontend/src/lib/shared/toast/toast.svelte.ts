import { SvelteMap } from 'svelte/reactivity'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
    id: string
    type: ToastType
    title: string
    message?: string
    duration: number
    startedAt: number
    remainingMs: number
}

function createToastsStore() {
    const items = new SvelteMap<string, Toast>()
    const timers = new SvelteMap<string, ReturnType<typeof setTimeout>>()

    function add(type: ToastType, title: string, message?: string, duration = 5000) {
        const id = crypto.randomUUID()
        items.set(id, {
            id,
            type,
            title,
            message,
            duration,
            startedAt: Date.now(),
            remainingMs: duration,
        })
        if (duration > 0) {
            schedule(id, duration)
        }
    }

    function schedule(id: string, ms: number) {
        clearTimeout(timers.get(id))
        timers.set(
            id,
            setTimeout(() => remove(id), ms),
        )
    }

    function remove(id: string) {
        clearTimeout(timers.get(id))
        timers.delete(id)
        items.delete(id)
    }

    function pause(id: string) {
        const item = items.get(id)
        if (!item || item.duration === 0) return
        clearTimeout(timers.get(id))
        const elapsed = Date.now() - item.startedAt
        item.remainingMs = Math.max(0, item.remainingMs - elapsed)
        item.startedAt = Date.now()
    }

    function resume(id: string) {
        const item = items.get(id)
        if (!item || item.duration === 0) return
        schedule(id, item.remainingMs)
    }

    return {
        get items() {
            return [...items.values()]
        },
        add,
        pause,
        resume,
        remove,
        success: (title: string, message?: string, duration?: number) =>
            add('success', title, message, duration),
        error: (title: string, description?: string, duration?: number) =>
            add('error', title, description, duration),
        warning: (title: string, description?: string, duration?: number) =>
            add('warning', title, description, duration),
        info: (title: string, description?: string, duration?: number) =>
            add('info', title, description, duration),
    }
}

export const toasts = createToastsStore()
