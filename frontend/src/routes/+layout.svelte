<script lang="ts">
    import '../styles/layout.css'
    import favicon from '$lib/assets/favicon.svg'
    import ToastContainer from '$lib/shared/toast/ToastContainer.svelte'
    import { page as pageData } from '$app/state'
    import { subscribeToPush } from '$lib/push'
    import { pushApi } from '$lib/api/push/client'
    import type { PushSubscriptionDto } from '$lib/api/push/types'

    let { children } = $props()
    const user = $derived(pageData.data.user)

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

<div class="wrap">
    <div class="app-container">
        <div class="page-container">
            <div class="bg-grid"></div>
            <div class="blob blob1"></div>
            <div class="blob blob2"></div>
            {@render children()}
        </div>
    </div>
</div>

<ToastContainer />
