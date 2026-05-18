<script>
    import BottomSheet from '$lib/ui/BottomSheet.svelte'
    import MiniProfile from '$lib/widgets/mini-profile/MiniProfile.svelte'
    import { UserCircle } from '@lucide/svelte'
    import { NAV_ITEMS } from '../items.config'
    import { page } from '$app/state'
    import BottomItem from './BottomItem.svelte'

    let open = $state(false)
    let activeId = $state(NAV_ITEMS[0]?.id ?? '')
    let user = $derived(page.data.user)
    const visibleItems = $derived(user ? NAV_ITEMS : NAV_ITEMS.filter(i => !i.authOnly))
</script>

<BottomSheet {open} onclose={() => (open = false)}>
    <MiniProfile />
</BottomSheet>

<div class="fixed bottom-5 w-full md:hidden">
    <div class="flex items-center justify-center gap-2 px-4">
        <div class="glass flex items-center gap-1 p-1.5">
            {#each visibleItems as item (item.id)}
                <BottomItem
                    {item}
                    variant={activeId === item.id ? 'active' : 'default'}
                    onClick={() => (activeId = item.id)}
                />
            {/each}
        </div>

        <button
            onclick={() => (open = true)}
            class="
                glass glass-circle
                flex size-[44px] shrink-0 items-center justify-center
                text-[var(--color-muted)] transition-all duration-[var(--duration-normal)]
                hover:text-[var(--color-text)]
                active:scale-[0.95]
            "
            aria-label="Profile"
        >
            <UserCircle size={20} strokeWidth={1.75} />
        </button>
    </div>
</div>
