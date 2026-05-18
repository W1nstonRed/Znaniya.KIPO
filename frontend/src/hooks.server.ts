import { authApi } from '$lib/api/auth/client'
import type { CurrentUser } from '$lib/api/auth/types'
import { ApiError, NetworkError } from '$lib/api/client/errors'
import type { Fetch } from '$lib/api/client/types'
import type { Handle } from '@sveltejs/kit'

async function resolveUser(fetch: Fetch): Promise<CurrentUser | null> {
    try {
        const res = await authApi.me(fetch)
        console.log('resolveUser', res)
        return res.user
    } catch (e) {
        if (e instanceof NetworkError) return null
        if (e instanceof ApiError) return null
        throw e
    }
}

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.user = await resolveUser(event.fetch)

    return resolve(event, {
        filterSerializedResponseHeaders: name => name === 'content-type',
    })
}
