<script lang="ts">
    import type { Snippet } from 'svelte'
    import AnimateComponent from './AnimateComponent.svelte'

    interface Props {
        children: Snippet
    }

    let { children }: Props = $props()
</script>

<AnimateComponent>
    <div class="surface">
        <div class="blob blob1"></div>
        <div class="blob blob2"></div>
        <div class="blob blob3"></div>

        <div class="content">
            {@render children?.()}
        </div>
    </div>
</AnimateComponent>

<style>
    .surface {
        position: relative;
        overflow: hidden;

        width: 320px;
        padding: 24px;

        border-radius: 20px;

        border: 1px solid rgba(255, 255, 255, 0.08);

        background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.015));

        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);

        isolation: isolate;
    }

    .content {
        position: relative;
        z-index: 2;
    }

    .blob {
        position: absolute;

        border-radius: 999px;

        filter: blur(70px);

        pointer-events: none;

        opacity: 0.75;

        mix-blend-mode: screen;

        z-index: 1;

        will-change: transform;
    }

    .blob1 {
        width: 240px;
        height: 240px;

        background: oklch(48% 0.22 285 / 0.55);

        animation: drift1 22s ease-in-out infinite alternate;
    }

    .blob2 {
        width: 180px;
        height: 180px;

        background: oklch(60% 0.18 20 / 0.35);

        animation: drift2 27s ease-in-out infinite alternate;
    }

    .blob3 {
        width: 160px;
        height: 160px;

        background: oklch(40% 0.2 250 / 0.4);

        animation: drift3 18s ease-in-out infinite alternate;
    }

    @keyframes drift1 {
        0% {
            transform: translate(-30%, -20%);
        }

        20% {
            transform: translate(40%, -10%);
        }

        40% {
            transform: translate(10%, 35%);
        }

        60% {
            transform: translate(-20%, 10%);
        }

        80% {
            transform: translate(30%, 50%);
        }

        100% {
            transform: translate(-10%, 20%);
        }
    }

    @keyframes drift2 {
        0% {
            transform: translate(60%, 50%);
        }

        25% {
            transform: translate(20%, -10%);
        }

        50% {
            transform: translate(-20%, 40%);
        }

        75% {
            transform: translate(50%, 0%);
        }

        100% {
            transform: translate(10%, 60%);
        }
    }

    @keyframes drift3 {
        0% {
            transform: translate(10%, 60%);
        }

        30% {
            transform: translate(50%, 20%);
        }

        60% {
            transform: translate(-10%, -20%);
        }

        80% {
            transform: translate(30%, 40%);
        }

        100% {
            transform: translate(60%, 10%);
        }
    }
</style>
