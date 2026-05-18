<script lang="ts">
    import { cn } from '$lib/utils'
    import { Shell } from '@lucide/svelte'
    import { getContext, type Snippet } from 'svelte'

    interface Props {
        variant?: 'primary' | 'danger' | 'icon' | 'ghost'
        isInline?: boolean
        size?: 'sm' | 'md' | 'lg'
        disabled?: boolean
        loading?: boolean
        type?: 'submit' | 'button'
        children: Snippet
        onClick?: () => void
        fullWidth?: boolean
    }

    const {
        variant = 'primary',
        isInline = false,
        size = 'md',
        disabled = false,
        loading = false,
        type = 'button',
        children,
        onClick = () => {},
        fullWidth = false,
    }: Props = $props()

    const form = getContext<any>('form')
    let isLoading = $derived(loading || (form?.isSubmitting ?? false))
</script>

<button
    onclick={onClick}
    aria-label="button"
    {type}
    class={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        'focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none',
        'active:scale-[0.97]',

        size === 'sm' && 'rounded-xl px-1 text-sm',
        size === 'md' && 'rounded-xl p-3 text-sm',
        size === 'lg' && 'rounded-2xl px-6 text-base',

        size === 'sm' && '[&>svg]:h-3 [&>svg]:w-3',
        size === 'md' && '[&>svg]:h-6 [&>svg]:w-6',
        size === 'lg' && '[&>svg]:h-5 [&>svg]:w-5',

        variant === 'primary' && [
            'bg-primary text-white',
            'shadow-[0_0_20px_oklch(70.551%_0.17762_48.484/0.35)]',
            'hover:shadow-[0_0_28px_oklch(70.551%_0.17762_48.484/0.5)]',
            'hover:brightness-110',
        ],

        variant === 'danger' && [
            'rounded-full bg-danger/30 text-danger',
            'shadow-[0_0_20px_oklch(0.577_0.245_27.325/0.3)]',
            'hover:brightness-170',
        ],

        variant === 'icon' && [
            'rounded-full border border-white/10 bg-white/5 text-primary backdrop-blur-md',
            'hover:border-white/20 hover:bg-white/10',
        ],

        variant === 'ghost' && [
            'border border-primary/30 bg-primary/10 text-primary backdrop-blur-md',
            'hover:border-primary/50 hover:bg-primary/20',
        ],

        isInline && [
            'border border-primary/40 bg-transparent text-white backdrop-blur-md',
            'hover:bg-primary/10',
        ],

        (disabled || isLoading) && 'cursor-not-allowed opacity-40 shadow-none hover:brightness-100',
        fullWidth && 'w-full',
    )}
    disabled={disabled || isLoading}
>
    {#if isLoading}
        <span class="animate-spin"><Shell /></span>
    {:else}
        {@render children?.()}
    {/if}
</button>
