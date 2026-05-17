import { api } from '../client/client.js'
import type { Fetch } from '../client/types.js'
import type { PushSubscriptionDto } from './types.js'

export const pushApi = {
    subscribe: (subscription: PushSubscriptionDto, customFetch?: Fetch) =>
        api.post('/push/subscribe', subscription, { fetch: customFetch }),

    unsubscribe: (endpoint: string, customFetch?: Fetch) =>
        api.post('/push/unsubscribe', { endpoint }, { fetch: customFetch }),
}
