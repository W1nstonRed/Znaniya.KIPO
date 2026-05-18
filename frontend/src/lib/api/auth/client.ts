import { api } from '../client/client'
import type { Fetch } from '../client/types'
import type { AuthResponse, MeResponse, LoginRequest, RegisterRequest } from './types'

export const authApi = {
    login: (dto: LoginRequest, fetch?: Fetch) =>
        api.post<AuthResponse>('/auth/login', dto, { fetch }),
    register: (dto: RegisterRequest, fetch?: Fetch) =>
        api.post<AuthResponse>('/auth/register', dto, { fetch }),
    me: (fetch?: Fetch, cookie?: string) =>
        api.get<MeResponse>('/auth/me', { fetch, headers: cookie ? { cookie } : {} }),
    logout: (fetch?: Fetch) => api.post<{ ok: true }>('/auth/logout', undefined, { fetch }),
    refresh: (fetch?: Fetch) => api.post<AuthResponse>('/auth/refresh', undefined, { fetch }),
}
