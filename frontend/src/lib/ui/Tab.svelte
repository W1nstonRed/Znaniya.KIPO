<script lang="ts">
    import { getContext, onMount, type Snippet } from 'svelte'

    interface Props {
        label: string
        value?: string
        children: Snippet
    }

    const { label, value = label, children }: Props = $props()

    const tabs = getContext<any>('tabs')

    onMount(() => {
        tabs.register(value, label)
    })

    let isActive = $derived(tabs.active === value)
</script>

{#if isActive}
    <div>
        {@render children()}
    </div>
{/if}
