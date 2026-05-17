import { api } from '../client/client.js'
import type { PushSubscriptionDto } from './types.js'

type Fetch = typeof globalThis.fetch

export const pushApi = {
    subscribe: (subscription: PushSubscriptionDto, customFetch?: Fetch) =>
        api.post('/push/subscribe', subscription, { fetch: customFetch }),

    unsubscribe: (endpoint: string, customFetch?: Fetch) =>
        api.post('/push/unsubscribe', { endpoint }, { fetch: customFetch }),
}
