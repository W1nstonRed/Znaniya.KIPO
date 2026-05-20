<!-- BottomBar.svelte -->
<script lang="ts">
    import { page } from '$app/stores'
    import { resolve } from '$app/paths'
    import { Lock, LogIn } from '@lucide/svelte'
    import { NAV_ITEMS, NAV_SECTIONS } from '$lib/configs/nav.config'
    import { page as pageData } from '$app/state'
    import { getInitials } from '$lib/utils/user.utils'
    import BottomSheet from '$lib/ui/BottomSheet.svelte'

    let user = $derived(pageData.data.user)
    let profileOpen = $state(false)
</script>

<nav class="fixed right-0 bottom-0 left-0 z-30 flex items-center justify-center gap-2 px-3 pb-4">
    <!-- Nav pill — скроллится горизонтально -->
    <div
        style="max-width: calc(100% - 52px - 8px);"
        class="flex [scrollbar-width:none] items-center overflow-x-auto rounded-full border border-white/15 bg-white/[0.08] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl [&::-webkit-scrollbar]:hidden"
    >
        <div class="flex items-center gap-0.5">
            {#each NAV_SECTIONS as section (section.key)}
                {#each NAV_ITEMS.filter(i => i.section === section.key) as item (item.id)}
                    {@const active = $page.url.pathname === item.href}
                    {@const locked = item.authOnly && !user}

                    {#if locked}
                        <div
                            class="relative flex h-10 w-10 flex-shrink-0 cursor-not-allowed items-center justify-center rounded-full text-white/[0.22] transition-colors hover:bg-white/[0.03]"
                            title={item.label}
                        >
                            <item.icon size={19} />
                            <Lock size={8} class="absolute top-1.5 right-1.5 text-white/20" />
                        </div>
                    {:else}
                        <a
                            href={item.href as any}
                            title={item.label}
                            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-150
                                {active
                                ? 'bg-white/[0.13] text-white/95'
                                : 'text-white/50 hover:bg-white/[0.06] hover:text-white/75'}"
                        >
                            <item.icon size={19} />
                        </a>
                    {/if}
                {/each}

                <div class="mx-0.5 h-6 w-px flex-shrink-0 bg-white/10"></div>
            {/each}
        </div>
    </div>

    <!-- Отдельная кнопка профиля / входа -->
    {#if user}
        <button
            onclick={() => (profileOpen = true)}
            aria-label="Профиль"
            class="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full border border-white/15 text-sm font-semibold text-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-opacity hover:opacity-85"
            style="background: linear-gradient(135deg, oklch(70% .18 48 / .35), oklch(60% .18 35 / .35));"
        >
            {getInitials(user.fullName ?? '')}
        </button>
    {:else}
        <a
            href={resolve('/auth')}
            aria-label="Войти"
            class="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/[0.18] shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-colors hover:bg-primary/[0.28]"
        >
            <LogIn size={20} class="text-primary" />
        </a>
    {/if}
</nav>

<!-- Profile sheet -->
<BottomSheet bind:open={profileOpen} onclose={() => (profileOpen = false)}>
    {#if user}
        <div class="flex flex-col gap-4 pt-2 pb-2">
            <div class="flex items-center gap-3">
                <div
                    class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white/90"
                    style="background: linear-gradient(135deg, oklch(70% .18 48), oklch(60% .18 35));"
                >
                    {getInitials(user.fullName ?? '')}
                </div>
                <div>
                    <p class="font-medium text-white/90">{user.fullName}</p>
                    <p class="text-sm text-white/40">{user.role}</p>
                </div>
            </div>

            <div class="h-px bg-white/[0.07]"></div>

            <a
                href={resolve('/auth/logout')}
                class="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] py-2.5 text-sm text-white/60 transition-colors hover:bg-white/[0.1]"
            >
                Выйти
            </a>
        </div>
    {/if}
</BottomSheet>
