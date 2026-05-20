<script lang="ts">
    import { toasts, type Toast } from '../../../stores/toast.svelte'
    import { CircleCheck, CircleX, Info, TriangleAlert, X } from '@lucide/svelte'

    interface Props {
        toast: Toast
    }

    const { toast }: Props = $props()

    const icons = {
        success: CircleCheck,
        error: CircleX,
        warning: TriangleAlert,
        info: Info,
    }

    const Icon = $derived(icons[toast.type])

    let progressEl = $state<HTMLDivElement | null>(null)
    let animationId: number

    function startProgress() {
        if (!progressEl || toast.duration === 0) return
        const start = Date.now()
        const initial = toast.remainingMs

        function tick() {
            if (!progressEl) return
            const elapsed = Date.now() - start
            const pct = Math.max(0, ((initial - elapsed) / toast.duration) * 100)
            progressEl.style.width = `${pct}%`
            if (pct > 0) animationId = requestAnimationFrame(tick)
        }

        animationId = requestAnimationFrame(tick)
    }

    function stopProgress() {
        cancelAnimationFrame(animationId)
    }

    function handleMouseEnter() {
        toasts.pause(toast.id)
        stopProgress()
    }

    function handleMouseLeave() {
        toasts.resume(toast.id)
        startProgress()
    }

    $effect(() => {
        startProgress()
        return () => stopProgress()
    })
</script>

<div
    class="toast toast--{toast.type}"
    role="button"
    tabindex="0"
    onclick={() => toasts.remove(toast.id)}
    onkeydown={e => (e.key === 'Enter' || e.key === ' ' ? toasts.remove(toast.id) : null)}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
>
    <div class="toast__icon">
        <Icon size={17} />
    </div>

    <div class="toast__body">
        <p class="toast__title">{toast.title}</p>
        {#if toast.message}
            <p class="toast__desc">{toast.message}</p>
        {/if}
    </div>

    <button
        class="toast__close"
        onclick={e => {
            e.stopPropagation()
            toasts.remove(toast.id)
        }}
        aria-label="Закрыть"
    >
        <X size={13} />
    </button>

    {#if toast.duration > 0}
        <div class="toast__progress-track">
            <div
                class="toast__progress-fill toast__progress-fill--{toast.type}"
                bind:this={progressEl}
            ></div>
        </div>
    {/if}
</div>

<style>
    .toast {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 14px 16px;
        border-radius: 16px;
        cursor: pointer;
        overflow: hidden;
        pointer-events: all;

        background: rgba(255, 255, 255, 0.07);
        backdrop-filter: blur(28px);
        -webkit-backdrop-filter: blur(28px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);

        transition:
            background 0.15s,
            border-color 0.15s;
        animation: slide-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes slide-in {
        from {
            opacity: 0;
            transform: translateX(20px) scale(0.96);
        }
        to {
            opacity: 1;
            transform: translateX(0) scale(1);
        }
    }

    .toast:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.18);
    }

    .toast__icon {
        flex-shrink: 0;
        margin-top: 1px;
    }

    .toast--success .toast__icon {
        color: oklch(70% 0.18 145);
    }
    .toast--error .toast__icon {
        color: oklch(68% 0.22 27);
    }
    .toast--warning .toast__icon {
        color: oklch(72% 0.18 60);
    }
    .toast--info .toast__icon {
        color: oklch(68% 0.16 240);
    }

    .toast__body {
        flex: 1;
        min-width: 0;
    }

    .toast__title {
        margin: 0;
        font-size: 13px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.4;
    }

    .toast__desc {
        margin: 2px 0 0;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
        line-height: 1.4;
    }

    .toast__close {
        all: unset;
        cursor: pointer;
        flex-shrink: 0;
        color: rgba(255, 255, 255, 0.25);
        display: flex;
        align-items: center;
        padding: 2px;
        border-radius: 6px;
        transition: color 0.15s;
        margin-top: 1px;
    }

    .toast__close:hover {
        color: rgba(255, 255, 255, 0.6);
    }

    .toast__progress-track {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: rgba(255, 255, 255, 0.06);
    }

    .toast__progress-fill {
        height: 100%;
        width: 100%;
        transition: none;
        border-radius: 0 2px 2px 0;
    }

    .toast--success .toast__progress-fill {
        background: oklch(70% 0.18 145);
    }
    .toast--error .toast__progress-fill {
        background: oklch(68% 0.22 27);
    }
    .toast--warning .toast__progress-fill {
        background: oklch(72% 0.18 60);
    }
    .toast--info .toast__progress-fill {
        background: oklch(68% 0.16 240);
    }
</style>
