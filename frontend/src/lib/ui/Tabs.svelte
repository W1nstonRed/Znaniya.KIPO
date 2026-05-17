<script lang="ts">
    import { setContext, untrack, type Snippet } from 'svelte'
    import { cn } from '$lib/utils'
    import { fade } from 'svelte/transition'

    interface Props {
        children: Snippet
        defaultValue?: string
    }

    const { children, defaultValue }: Props = $props()

    const initialValue = untrack(() => defaultValue ?? '')
    let active = $state(initialValue)
    let tabs = $state<{ value: string; label: string }[]>([])

    setContext('tabs', {
        get active() {
            return active
        },
        setActive: (value: string) => (active = value),
        register: (value: string, label: string) => {
            if (tabs.find(t => t.value === value)) return
            tabs.push({ value, label })
            if (!untrack(() => defaultValue) && tabs.length === 1) active = value
        },
    })
</script>

<div class="inline-flex h-full flex-col gap-4">
    <div
        class="relative flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-white/8 bg-white/5 p-1.5 backdrop-blur-md"
    >
        {#each tabs as tab (tab.value)}
            <button
                type="button"
                class={cn(
                    'relative rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
                    active === tab.value
                        ? 'bg-primary text-white shadow-[0_0_16px_oklch(70.551%_0.17762_48.484/0.4)]'
                        : 'text-white/40 hover:bg-white/5 hover:text-white/70',
                )}
                onclick={() => (active = tab.value)}
            >
                {tab.label}
            </button>
        {/each}
    </div>

    {#key active}
        <div
            class="flex h-full min-h-48 items-center justify-center overflow-hidden"
            in:fade={{ duration: 150 }}
        >
            {@render children()}
        </div>
    {/key}
</div>
