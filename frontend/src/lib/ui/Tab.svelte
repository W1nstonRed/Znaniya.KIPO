<script lang="ts">
    import { getContext, onMount, type Snippet } from 'svelte'

    interface Props {
        label: string
        value?: string
        children: Snippet
    }

    const { label, value = label, children }: Props = $props()

    const tabs = getContext<any>('auth_tabs')

    let isActive = $derived(tabs.active === value)

    onMount(() => {
        tabs.register(value, label)
    })
</script>

{#if isActive}
    <div class="">
        {@render children?.()}
    </div>
{/if}
