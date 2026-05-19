<script lang="ts">
    import favicon from '$lib/assets/favicon.svg'
    import { page as pageData } from '$app/state'
    import { page } from '$app/stores'
    import { derived } from 'svelte/store'
    import { goto } from '$app/navigation'
    import { resolve } from '$app/paths'
    import { subscribeToPush } from '$lib/push'
    import { pushApi } from '$lib/api/push/client'
    import type { PushSubscriptionDto } from '$lib/api/push/types'
    import Sidebar from '$lib/shared/nav/sidebar/Sidebar.svelte'
    import Bottombar from '$lib/shared/nav/bottombar/Bottombar.svelte'

    let { children } = $props()
    const protectedRoutes = ['/dashboard', '/profile']
    const isProtected = derived(page, $page =>
        protectedRoutes.some(route => $page.url.pathname.startsWith(route)),
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
            .catch(error => {
                console.error('Push subscribe failed:', error)
            })
    })
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<div class="app-shell">
    <aside class="sidebar">
        <Sidebar />
    </aside>
    <div class="main">
        <main class="content">
            <div class="page-container">
                {@render children()}
            </div>
        </main>
        <footer class="bottom">
            <Bottombar />
        </footer>
    </div>
</div>
