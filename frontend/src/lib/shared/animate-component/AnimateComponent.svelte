<script>
    import { page } from '$app/stores'
    import { fly } from 'svelte/transition'

    let { children } = $props()
</script>

{#key $page.url}
    <div
        style="display: contents"
        in:fly={{ x: -20, duration: 350, opacity: 0 }}
        out:fly={{ x: -20, duration: 350, opacity: 0 }}
    >
        {@render children()}
    </div>
{/key}
