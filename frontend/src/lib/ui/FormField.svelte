<script lang="ts">
    import { cn } from '$lib/utils'
    import { getContext, type Snippet } from 'svelte'

    interface Props {
        name: string
        label?: string
        helperText?: string
        fullWidth?: boolean
        children: Snippet<[{ value: any; error: string; form: any }]>
    }

    const { name, label, helperText, fullWidth = false, children }: Props = $props()

    const form = getContext<any>('form')
    let value = $derived(form.values[name])
    let error = $derived(form.errors[name])
</script>

<div class={cn('flex flex-col gap-2', fullWidth && 'w-full')}>
    {#if label}
        <label for={name} class="text-xs font-medium tracking-wide text-white/50 uppercase">
            {label}
        </label>
    {/if}

    <div>
        {@render children?.({ value, error, form })}
    </div>

    {#if error}
        <span class="flex items-center gap-1 text-xs text-danger/80">
            {error}
        </span>
    {:else if helperText}
        <span class="text-xs text-white/30">
            {helperText}
        </span>
    {/if}
</div>
