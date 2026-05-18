import { PUBLIC_API_BASE_URL } from '$env/static/public'

const isServer = typeof window === 'undefined'

export const config = {
    apiBaseUrl: isServer
        ? 'http://localhost:3000' // SSR — напрямую к бэкенду
        : PUBLIC_API_BASE_URL || 'http://localhost:3000/api', // браузер — через nginx
}
