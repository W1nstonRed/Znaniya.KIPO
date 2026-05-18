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
        // Убираем gap и padding — центрируем через flex
        'relative flex items-center justify-center overflow-hidden',
        'h-10 rounded-[var(--radius-lg)]',
        'font-medium text-[var(--text-sm)]',
        'transition-all duration-300 ease-[var(--ease-default)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:outline-none',
        'cursor-pointer select-none active:scale-[0.95]',
        'p-0', // явно сбрасываем padding

        isActive
            ? 'w-auto gap-1.5 pr-3 pl-2.5 text-[var(--color-primary)]'
            : 'w-10 text-[var(--color-muted)]',

        !isActive && 'hover:bg-white/8 hover:text-[var(--color-text)]',
        isActive && [
            'bg-[var(--color-primary-subtle)]',
            'border border-[oklch(70%_0.18_48_/_0.25)]',
            'shadow-[0_0_12px_oklch(70%_0.18_48_/_0.15)]',
        ],

        disabled && 'pointer-events-none cursor-not-allowed opacity-40',
    )}
    {disabled}
>
    <!-- Иконка без обёртки span — напрямую, flex сам центрирует -->
    <item.icon size={18} strokeWidth={isActive ? 2.25 : 1.75} />

    <span
        class={cn(
            'overflow-hidden whitespace-nowrap transition-all duration-300 ease-[var(--ease-default)]',
            isActive ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0',
        )}
    >
        {item.label}
    </span>
</button>
