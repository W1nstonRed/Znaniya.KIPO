<script lang="ts">
    import { toasts, type Toast } from './toast.svelte'
    import AnimateComponent from '../animate-component/AnimateComponent.svelte'
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

<AnimateComponent>
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
            <Icon size={18} />
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
            <X size={14} />
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
</AnimateComponent>

<style>
    .toast {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 16px 18px;
        border-radius: 12px;
        background: #1a1a1a;
        border: 1px solid #2a2a2a;
        cursor: pointer;
        overflow: hidden;
        transition: border-color 0.15s;
        pointer-events: all;
        animation: slide-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes slide-in {
        from {
            opacity: 0;
            transform: translateX(24px) scale(0.97);
        }
        to {
            opacity: 1;
            transform: translateX(0) scale(1);
        }
    }

    .toast:hover {
        border-color: #3a3a3a;
    }

    .toast__icon {
        flex-shrink: 0;
        margin-top: 1px;
    }

    .toast--success .toast__icon {
        color: #4ade80;
    }
    .toast--error .toast__icon {
        color: #f87171;
    }
    .toast--warning .toast__icon {
        color: #f97316;
    }
    .toast--info .toast__icon {
        color: #60a5fa;
    }

    .toast__body {
        flex: 1;
        min-width: 0;
    }

    .toast__title {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        color: #f5f5f5;
        line-height: 1.4;
    }

    .toast__desc {
        margin: 2px 0 0;
        font-size: 13px;
        color: #888;
        line-height: 1.4;
    }

    .toast__close {
        all: unset;
        cursor: pointer;
        flex-shrink: 0;
        color: #555;
        display: flex;
        align-items: center;
        padding: 2px;
        border-radius: 4px;
        transition: color 0.15s;
        margin-top: 1px;
    }
    .toast__close:hover {
        color: #aaa;
    }

    .toast__progress-track {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: #2a2a2a;
    }

    .toast__progress-fill {
        height: 100%;
        width: 100%;
        transition: none;
    }

    .toast__progress-fill--success {
        background: #4ade80;
    }
    .toast__progress-fill--error {
        background: #f87171;
    }
    .toast__progress-fill--warning {
        background: #f97316;
    }
    .toast__progress-fill--info {
        background: #60a5fa;
    }
</style>
