export type ApiErrorCode =
    // Auth
    | 'INVALID_CREDENTIALS'
    | 'USERNAME_TAKEN'
    | 'AUTH_REQUIRED'
    | 'ACCESS_TOKEN_EXPIRED'
    | 'ACCESS_TOKEN_INVALID'
    | 'REFRESH_TOKEN_MISSING'
    | 'REFRESH_TOKEN_INVALID'
    | 'SESSION_EXPIRED'
    | 'REGISTRATION_ROLE_NOT_ALLOWED'
    | 'REGISTRATION_PERSON_REQUIRED'
    | 'STUDENT_NOT_FOUND'
    | 'STUDENT_ALREADY_LINKED'
    | 'TEACHER_NOT_FOUND'
    | 'TEACHER_ALREADY_LINKED'
    | 'GROUP_NOT_FOUND'
    // Общие
    | 'VALIDATION_ERROR'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'UNIQUE_CONSTRAINT_FAILED'
    | 'RECORD_NOT_FOUND'
    | 'DATABASE_ERROR'
    | 'INTERNAL_SERVER_ERROR'
    | 'BAD_REQUEST'
    | 'UNAUTHORIZED'
    // Фронт
    | 'NETWORK_ERROR'
    | 'UNKNOWN_ERROR'

export type ApiErrorData = {
    ok: false
    error: {
        code: ApiErrorCode | string
        message: string
        details?: string[]
    }
    meta: {
        statusCode: number
        path: string
        timestamp: string
    }
}

export type RequestOptions = RequestInit & {
    fetch?: typeof globalThis.fetch
}

type OK<T> = {
    ok: true
    data: T
}

type Err = {
    ok: false
    message: string
    code: ApiErrorCode | string
    status: number
    details?: string[]
}

export type Result<T> = OK<T> | Err
export type Fetch = typeof globalThis.fetch
