<script lang="ts">
    import type { Snippet } from 'svelte'

    type Variant = 'purple' | 'blue' | 'orange'

    type Props = {
        children: Snippet
        variant?: Variant
        class?: string
    }

    const { children, variant = 'purple', class: className = '' }: Props = $props()
</script>

<div class="surface surface--{variant} {className}">
    <div class="surface-content">
        {@render children()}
    </div>
</div>

<style>
    .surface {
        position: relative;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: #1a1a1a;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        overflow: hidden;
        isolation: isolate;
    }

    .surface::before,
    .surface::after {
        content: '';
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        z-index: 0;
        filter: blur(50px);
        width: clamp(100px, 55%, 260px);
        height: clamp(100px, 55%, 260px);
    }

    .surface-content {
        position: relative;
        z-index: 1;
    }

    /* --- purple --- */
    .surface--purple::before {
        background: oklch(38% 0.26 290 / 0.6);
        top: -20%;
        left: -10%;
        animation: orb-a 10s ease-in-out infinite;
    }
    .surface--purple::after {
        background: oklch(30% 0.2 330 / 0.5);
        bottom: -20%;
        right: -10%;
        animation: orb-b 13s ease-in-out infinite;
        animation-delay: -5s;
    }

    /* --- blue --- */
    .surface--blue::before {
        background: oklch(32% 0.24 250 / 0.6);
        top: -20%;
        right: -10%;
        animation: orb-a 11s ease-in-out infinite;
        animation-delay: -2s;
    }
    .surface--blue::after {
        background: oklch(26% 0.18 275 / 0.5);
        bottom: -20%;
        left: -10%;
        animation: orb-b 14s ease-in-out infinite;
        animation-delay: -7s;
    }

    /* --- orange --- */
    .surface--orange::before {
        background: oklch(45% 0.12 55 / 0.4);
        top: -20%;
        left: 20%;
        animation: orb-a 9s ease-in-out infinite;
        animation-delay: -3s;
    }
    .surface--orange::after {
        background: oklch(32% 0.2 290 / 0.45);
        bottom: -20%;
        right: 10%;
        animation: orb-b 12s ease-in-out infinite;
        animation-delay: -6s;
    }

    @keyframes orb-a {
        0%,
        100% {
            transform: translate(0, 0) scale(1);
        }
        33% {
            transform: translate(30%, 25%) scale(1.06);
        }
        66% {
            transform: translate(15%, 40%) scale(0.96);
        }
    }

    @keyframes orb-b {
        0%,
        100% {
            transform: translate(0, 0) scale(1);
        }
        33% {
            transform: translate(-25%, -30%) scale(1.05);
        }
        66% {
            transform: translate(-40%, -15%) scale(0.97);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .surface::before,
        .surface::after {
            animation: none;
        }
    }
</style>
