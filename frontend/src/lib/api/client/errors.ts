import type { ApiErrorCode, ApiErrorData } from './types'

export class ApiError extends Error {
    constructor(
        public readonly code: ApiErrorCode | string,
        message: string,
        public readonly status: number,
        public readonly details?: string[],
    ) {
        super(message)
        this.name = 'ApiError'
    }

    static fromData(data: ApiErrorData): ApiError {
        return new ApiError(
            data.error.code,
            data.error.message,
            data.meta.statusCode,
            data.error.details,
        )
    }
}

export class NetworkError extends ApiError {
    constructor(message = 'Нет соединения с сервером') {
        super('NETWORK_ERROR', message, 0)
        this.name = 'NetworkError'
    }
}
