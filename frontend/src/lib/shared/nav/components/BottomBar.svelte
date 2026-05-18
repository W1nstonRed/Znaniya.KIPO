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

<BottomSheet bind:open onclose={() => (open = false)}>
    <MiniProfile />
</BottomSheet>

<div class="fixed bottom-10 w-full md:hidden">
    <div class="flex items-center justify-center gap-2 px-4">
        <div class="glass flex items-center gap-2 p-2">
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
                duration-normal flex size-12 shrink-0 items-center
                justify-center text-muted transition-all
                hover:text-foreground
                active:scale-[0.95]
            "
            aria-label="Profile"
        >
            <UserCircle size={20} strokeWidth={1.75} />
        </button>
    </div>
</div>
