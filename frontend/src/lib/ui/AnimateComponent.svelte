<script lang="ts">
    import type { Snippet } from 'svelte'
    import { fly } from 'svelte/transition'

    type Props = {
        children: Snippet
    }

    let { children }: Props = $props()

    let mounted = $derived(false)

    $effect(() => {
        mounted = true
    })
</script>

{#if mounted}
    <div
        in:fly={{ x: -20, duration: 350, opacity: 0 }}
        out:fly={{ x: -20, duration: 200, opacity: 0 }}
    >
        {@render children()}
    </div>
{/if}
