import { ApiError } from './errors'
import type { Result } from './types'

export function getErrorMessage(data: unknown): string {
    if (typeof data === 'object' && data !== null && 'message' in data) {
        const message = data.message

        if (typeof message === 'string') {
            return message
        }

        if (Array.isArray(message) && message.every(item => typeof item === 'string')) {
            return message.join(', ')
        }
    }

    return 'Ошибка запроса'
}

export async function tryFetch<T>(fn: () => Promise<T>): Promise<Result<T>> {
    try {
        const data = await fn()
        return { ok: true, data }
    } catch (e) {
        if (e instanceof ApiError) {
            return {
                ok: false,
                message: e.message,
                code: e.code,
                status: e.status,
                details: e.details,
            }
        }
        return {
            ok: false,
            message: 'Неизвестная ошибка',
            code: 'UNKNOWN_ERROR',
            status: 500,
        }
    }
}
