<script lang="ts">
    import favicon from '$lib/assets/favicon.svg'
    import { page as pageData } from '$app/state'
    import { subscribeToPush } from '$lib/push'
    import { pushApi } from '$lib/api/push/client'
    import type { PushSubscriptionDto } from '$lib/api/push/types'
    import { derived } from 'svelte/store'
    import { page } from '$app/stores'
    import { goto } from '$app/navigation'
    import { resolve } from '$app/paths'
    import BottomBar from '$lib/shared/nav/components/BottomBar.svelte'

    let { children } = $props()

    const protectedRoutes = ['/dashboard', '/profile']
    const isProtected = derived(page, $page =>
        protectedRoutes.some(r => $page.url.pathname.startsWith(r)),
    )
    const user = $derived(pageData.data.user)

    $effect(() => {
        if ($isProtected && !user) {
            goto(resolve('/auth?reason=unauthorized'))
        }
    })

    $effect(() => {
        if (!user) return

        subscribeToPush()
            .then(sub => {
                if (!sub) return

                const dto: PushSubscriptionDto = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))),
                        auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))),
                    },
                }

                return pushApi.subscribe(dto)
            })
            .catch(e => console.error('Push subscribe failed:', e))
    })
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<div class="app-container">
    <div class="page-container">
        {@render children()}
    </div>
</div>
<BottomBar />
