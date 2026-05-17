import { PUBLIC_API_BASE_URL } from '$env/static/public'

export const config = {
    apiBaseUrl: PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
}
