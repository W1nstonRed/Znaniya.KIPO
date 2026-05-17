<script lang="ts">
    import { cn } from '$lib/utils'
    import { getContext } from 'svelte'

    interface Props {
        name?: string
        placeholder?: string
        type?: string
        size?: 'sm' | 'md' | 'lg'
        disabled?: boolean
        loading?: boolean
        readOnly?: boolean
        fullWidth?: boolean
        LeftIcon?: any
        RightIcon?: any
        value?: string
        onchange?: (v: string) => void
    }

    const {
        name,
        placeholder,
        type = 'text',
        size = 'md',
        disabled = false,
        loading = false,
        readOnly = false,
        fullWidth = false,
        LeftIcon,
        RightIcon,
        value: valueProp,
        onchange,
    }: Props = $props()

    const form = getContext<any>('form')

    let value = $derived(form && name ? form.values[name] : valueProp)
    let error = $derived(form && name ? form.errors[name] : undefined)
    let isDisabled = $derived(disabled || loading || (form?.isSubmitting ?? false))

    function onInput(v: string) {
        if (form && name) {
            form.setValue(name, v)
        } else {
            onchange?.(v)
        }
    }
</script>

<div class={cn('relative', fullWidth && 'w-full')}>
    <div
        class={cn(
            'flex items-center gap-2 border transition-all duration-200 ease-out',
            'bg-white/5 backdrop-blur-md',
            'rounded-xl',

            size === 'sm' && 'h-9 px-3 text-sm',
            size === 'md' && 'h-11 px-4 text-sm',
            size === 'lg' && 'h-13 px-5 text-base',

            error
                ? 'border-danger/50 shadow-[0_0_0_3px_oklch(0.577_0.245_27.325/0.15)]'
                : 'border-white/8 focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_oklch(70.551%_0.17762_48.484/0.15)]',

            isDisabled && 'cursor-not-allowed opacity-40',
            fullWidth && 'w-full',
        )}
    >
        {#if LeftIcon}
            <span class="shrink-0 text-white/30">
                <LeftIcon size={16} />
            </span>
        {/if}

        <input
            {name}
            class="w-full flex-1 border-0 bg-transparent text-white outline-none
                   placeholder:text-white/25 focus:shadow-none focus:ring-0 focus:outline-none"
            {value}
            {placeholder}
            {type}
            disabled={isDisabled}
            readonly={readOnly}
            oninput={e => onInput((e.target as HTMLInputElement).value)}
        />

        {#if RightIcon}
            <span class="shrink-0 text-white/30">
                <RightIcon size={16} />
            </span>
        {/if}
    </div>

    {#if isDisabled}
        <div class="absolute inset-0 overflow-hidden rounded-xl">
            <div class="shimmer h-full w-full"></div>
        </div>
    {/if}
</div>

<style>
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0px 1000px transparent inset;
        -webkit-text-fill-color: white;
        transition: background-color 5000s ease-in-out 0s;
    }
    .shimmer {
        background: linear-gradient(
            90deg,
            transparent 0%,
            color-mix(in srgb, var(--color-muted) 15%, transparent) 50%,
            transparent 100%
        );
        background-size: 200% 100%;
        animation: shimmer 3.5s infinite;
    }

    @keyframes shimmer {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }
</style>
