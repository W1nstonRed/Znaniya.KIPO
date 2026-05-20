<script lang="ts">
    import { page } from '$app/stores'
    import { Lock } from '@lucide/svelte'
    import { NAV_ITEMS, NAV_SECTIONS } from '$lib/configs/nav.config'
    import { resolve } from '$app/paths'
    import { page as pageData } from '$app/state'
    import { getInitials } from '$lib/utils/user.utils'

    let user = $derived(pageData.data.user)
</script>

<div class="flex h-full w-full items-center justify-center p-4">
    <aside class="flex h-full w-full flex-col glass-card shadow-none">
        <!-- Header -->
        <div class="border-b border-white/[0.07] px-4 pt-6 pb-3.5">
            <div class="text-base font-semibold tracking-tight text-white/90">
                Знания.<span class="text-primary">КИПО</span>
            </div>
        </div>

        <!-- Nav -->
        <nav class="flex flex-1 flex-col gap-px overflow-y-auto p-2">
            {#each NAV_SECTIONS as section (section.key)}
                {@const items = NAV_ITEMS.filter(i => i.section === section.key)}

                <p
                    class="px-2 pt-2 pb-0.5 text-[10px] font-medium tracking-widest text-white/[0.28] uppercase first:pt-1"
                >
                    {section.label}
                </p>

                {#each items as item (item.id)}
                    {@const active = $page.url.pathname === item.href}
                    {@const locked = item.authOnly && !user}

                    {#if locked}
                        <div
                            class="relative flex cursor-not-allowed items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-white/[0.28] transition-colors hover:bg-white/[0.04] hover:text-white/40"
                            title="Требуется авторизация"
                        >
                            <item.icon size={16} />
                            <span class="flex-1">{item.label}</span>
                            <Lock size={12} class="text-white/20" />
                        </div>
                    {:else}
                        <a
                            href={item.href as any}
                            class="relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors duration-150
                                {active
                                ? 'bg-primary/15 text-primary'
                                : 'text-white/65 hover:bg-white/[0.07] hover:text-white/90'}"
                        >
                            {#if active}
                                <span
                                    class="absolute top-[20%] bottom-[20%] left-0 w-[3px] rounded-r-full bg-primary"
                                ></span>
                            {/if}
                            <item.icon size={16} />
                            <span>{item.label}</span>
                        </a>
                    {/if}
                {/each}

                <div class="mx-2 my-1 h-px bg-white/[0.06]"></div>
            {/each}
        </nav>

        <!-- Footer -->
        <div class="flex flex-col gap-4 border-t border-white/[0.07] px-2 pt-2 pb-3.5">
            {#if user}
                <button
                    class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-white/[0.07]"
                >
                    <div
                        class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-600 text-[11px] font-semibold text-white/90"
                    >
                        {getInitials(user.fullName ?? '')}
                    </div>
                    <div class="min-w-0 flex-1 text-left">
                        <p class="truncate text-[13px] font-medium text-white/85">
                            {user.fullName}
                        </p>
                        <p class="text-[11px] text-white/35">{user.role}</p>
                    </div>
                </button>
            {:else}
                <p
                    class="flex items-center gap-1.5 rounded-lg border border-primary/15 bg-primary/[0.08] px-2.5 py-1.5 text-[11px] text-orange-300/70"
                >
                    <Lock size={12} />
                    Войдите, чтобы открыть все разделы
                </p>
                <a
                    href={resolve('/auth')}
                    class="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                    Войти в аккаунт
                </a>
            {/if}
        </div>
    </aside>
</div>
