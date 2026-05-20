<script lang="ts">
    import { page as pageData } from '$app/state'
    import { page } from '$app/stores'
    import { derived } from 'svelte/store'
    import { goto } from '$app/navigation'
    import { resolve } from '$app/paths'
    import { pushApi } from '$lib/api/push/client'
    import type { PushSubscriptionDto } from '$lib/api/push/types'
    import { subscribeToPush } from '$lib/utils/push.utils'
    import Sidebar from '$lib/components/globals/nav/Sidebar.svelte'
    import Bottombar from '$lib/components/globals/nav/Bottombar.svelte'

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

<div class="flex h-dvh w-screen overflow-hidden">
    <!-- Десктопная фиксированная панель -->
    <div class="hidden h-full w-54 shrink-0 overflow-y-auto md:block">
        <Sidebar />
    </div>

    <!-- Адаптивный контейнер для контента -->
    <div class="flex min-w-0 flex-1 flex-col">
        <main class="w-full flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div class="mx-auto max-w-dvw">
                {@render children()}
            </div>
        </main>

        <!-- Мобильная нижняя панель -->
        <div class="shrink-0 md:hidden">
            <Bottombar />
        </div>
    </div>
</div>
