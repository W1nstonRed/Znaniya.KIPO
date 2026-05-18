<script>
    import BottomSheet from '$lib/ui/BottomSheet.svelte'
    import MiniProfile from '$lib/widgets/mini-profile/MiniProfile.svelte'
    import { UserCircle } from '@lucide/svelte'
    import { NAV_ITEMS } from '../items.config'
    import { page } from '$app/state'
    import BottomItem from './BottomItem.svelte'

    let open = $state(false)
    let user = $derived(page.data.user)
    const visibleItems = $derived(user ? NAV_ITEMS : NAV_ITEMS.filter(i => !i.authOnly))
</script>

<BottomSheet {open} onclose={() => (open = false)}>
    <MiniProfile />
</BottomSheet>

<!-- нижняя панель -->
<div class="fixed bottom-5 w-full md:hidden">
    <div class="flex items-center justify-center gap-x-3 p-3">
        <div class="glass flex w-full gap-3 p-3">
            {#each visibleItems as item (item.id)}
                <BottomItem variant="default" {item} />
            {/each}
        </div>
        <button onclick={() => (open = true)} class="glass glass-circle p-5">
            <UserCircle size={24} />
        </button>
    </div>
</div>
