<script lang="ts">
    import { cn } from '$lib/utils'
    import type { NavItem } from '../items.config'

    interface Props {
        item: NavItem
        variant?: 'default' | 'active'
        disabled?: boolean
        onClick?: () => void
    }

    const { item, variant = 'default', disabled = false, onClick = () => {} }: Props = $props()

    const isActive = $derived(variant === 'active')
</script>

<button
    onclick={onClick}
    aria-label={item.label}
    class={cn(
        'relative flex items-center justify-center overflow-hidden',
        'h-12 rounded-lg',
        'text-sm font-medium',
        'transition-all duration-300 ease-(--ease-default)',
        'focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:outline-none',
        'cursor-pointer select-none active:scale-[0.95]',
        'p-0',

        isActive ? 'w-auto gap-1.5 pr-3 pl-2.5 text-primary' : 'w-12 text-muted',

        !isActive && 'hover:bg-white/8 hover:text-foreground',
        isActive && [
            'bg-primary-subtle',
            'border border-[oklch(70%_0.18_48/0.25)]',
            'shadow-[0_0_12px_oklch(70%_0.18_48/0.15)]',
        ],

        disabled && 'pointer-events-none cursor-not-allowed opacity-40',
    )}
    {disabled}
>
    <item.icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />

    <span
        class={cn(
            'overflow-hidden whitespace-nowrap transition-all duration-300 ease-(--ease-default)',
            isActive ? 'max-w-25 opacity-100' : 'max-w-0 opacity-0',
        )}
    >
        {item.label}
    </span>
</button>
