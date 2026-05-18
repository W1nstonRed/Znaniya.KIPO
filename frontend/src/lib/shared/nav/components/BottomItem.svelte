<script lang="ts">
    import { cn } from '$lib/utils'
    import type { NavItem } from '../items.config'

    interface Props {
        variant?: 'default' | 'icon' | 'ghost'
        disabled?: boolean
        class?: string
        onClick?: () => void
        type?: 'button' | 'submit'
        item: NavItem
    }

    let {
        variant = 'default',
        disabled = false,
        class: className,
        onClick,
        type = 'button',
        item,
    }: Props = $props()
</script>

<button
    {type}
    onclick={onClick}
    {disabled}
    class={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        'focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none',
        'active:scale-[0.97]',

        variant === 'default' && [
            'rounded-md border border-border bg-surface px-2 py-2 text-foreground',
            'hover:bg-elevated',
        ],

        variant === 'icon' && [
            'rounded-full border border-white/10 bg-white/5 p-2 text-primary backdrop-blur-md',
            'hover:border-white/20 hover:bg-white/10',
        ],

        variant === 'ghost' && ['bg-transparent text-muted hover:bg-white/5 hover:text-foreground'],

        disabled && 'cursor-not-allowed opacity-40 shadow-none',

        className,
    )}
>
    <div class="flex max-w-10 flex-col items-center justify-center truncate">
        <item.icon size={12} />
        <p class="text-sm">{item.label}</p>
    </div>
</button>
