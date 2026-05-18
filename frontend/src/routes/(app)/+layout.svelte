<script lang="ts">
    import favicon from '$lib/assets/favicon.svg'
    import { page as pageData } from '$app/state'
    import { subscribeToPush } from '$lib/push'
    import type { PushSubscriptionDto } from '$lib/api/push/types'
    import { derived } from 'svelte/store'
    import { page } from '$app/stores'
    import { goto } from '$app/navigation'
    import { resolve } from '$app/paths'
    import BottomBar from '$lib/shared/nav/components/BottomBar.svelte'
    import { pushApi } from '$lib/api/push/client'
    import SideBar from '$lib/shared/nav/components/SideBar.svelte'

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
    <!-- Sidebar только на десктопе -->
    <div class="hidden md:block">
        <SideBar />
    </div>

    <!-- Контент со сдвигом на десктопе -->
    <div class="content-wrap">
        <div class="page-container">
            {@render children()}
        </div>
        <div class="block md:hidden">
            <BottomBar />
        </div>
    </div>
</div>

<!-- BottomBar только на мобиле -->

<style>
    .content-wrap {
        width: 100%;
    }

    @media (min-width: 768px) {
        .content-wrap {
            padding-left: 64px; /* ширина свёрнутого sidebar */
            transition: padding-left 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
    }
</style>
