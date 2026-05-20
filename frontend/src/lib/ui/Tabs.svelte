<script lang="ts">
    import { cn } from '$lib/utils/cn.utils'
    import { setContext, untrack, type Snippet } from 'svelte'
    import { fade } from 'svelte/transition'
    import {} from 'svelte'

    interface Props {
        children: Snippet
        defaultValue?: string
    }

    const { children, defaultValue }: Props = $props()
    const initVal = untrack(() => defaultValue ?? '')

    let active = $state(initVal)
    let tabs = $state<{ val: string; label: string }[]>([])

    function register(val: string, label: string) {
        if (tabs.some(t => t.val === val)) return
        tabs = [...tabs, { val, label }]
        if (!initVal && tabs.length === 1) {
            active = val
        }
    }
    function setActive(val: string) {
        active = val
    }

    setContext('auth_tabs', {
        get active() {
            return active
        },
        get tabs() {
            return tabs
        },
        register,
        setActive,
    })
</script>

<div
    class={cn('inline-flex flex-col gap-4 rounded-md border border-background', 'w-full p-3 glass')}
>
    <div class="flex flex-row max-sm:flex-col">
        {#each tabs as tab (tab.val)}
            <button
                aria-label="button"
                type="button"
                class={cn(
                    'rounded-xl px-4 py-2 text-sm font-medium',
                    active === tab.val
                        ? 'bg-primary text-foreground'
                        : 'text-foreground/40 hover:bg-white/5 hover:text-foreground/70',
                )}
                onclick={() => setActive(tab.val)}
            >
                {tab.label}
            </button>
        {/each}
    </div>
</div>
{#key active}
    <div in:fade={{ duration: 150 }} class="min-h-48">
        {@render children?.()}
    </div>
{/key}
