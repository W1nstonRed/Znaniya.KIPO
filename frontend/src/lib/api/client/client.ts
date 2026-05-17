import { config } from './config'
import { ApiError, NetworkError } from './errors'
import type { ApiErrorData, RequestOptions } from './types'

const NETWORK_ERROR_MESSAGES: Record<string, string> = {
    'Failed to fetch': 'Нет соединения с сервером',
    'Load failed': 'Нет соединения с сервером',
    NetworkError: 'Нет соединения с сервером',
    AbortError: 'Нет соединения с сервером',
    TimeoutError: 'Нет соединения с сервером',
}

function classifyNetworkError(error: unknown): never {
    if (error instanceof DOMException && error.name == 'AbortError') {
        throw new NetworkError('Запрос был отменен')
    }
    if (error instanceof TypeError) {
        throw new NetworkError(NETWORK_ERROR_MESSAGES[error.name] ?? 'Ошибка сети')
    }
    throw new NetworkError()
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { fetch: customFetch, ...init } = options
    const fetchFn = customFetch ?? globalThis.fetch
    const headers = new Headers(init.headers)
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }
    let response: Response

    try {
        response = await fetchFn(`${config.apiBaseUrl}${path}`, {
            ...init,
            headers,
            credentials: 'include',
        })
    } catch (error) {
        classifyNetworkError(error)
    }
    if (response.status === 204) return undefined as T

    const contentType = response.headers.get('Content-Type')
    if (!contentType?.includes('application/json')) {
        throw new ApiError('UNKNOWN_ERROR', 'Неожиданный формат ответа', response.status)
    }
    const data = await response.json()
    if (!response.ok) throw ApiError.fromData(data as ApiErrorData)
    return data as T
}

export const api = {
    get: <T>(path: string, options?: RequestOptions) =>
        request<T>(path, { ...options, method: 'GET' }),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
        request<T>(path, {
            ...options,
            method: 'POST',
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }),
    patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
        request<T>(path, {
            ...options,
            method: 'PATCH',
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }),
    delete: <T>(path: string, options?: RequestOptions) =>
        request<T>(path, { ...options, method: 'DELETE' }),
}
