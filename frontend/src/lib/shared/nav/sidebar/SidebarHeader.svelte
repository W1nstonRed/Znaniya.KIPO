<script lang="ts">
    import { resolve } from '$app/paths'
</script>

<a class="header" href={resolve('/')}>
    <div class="logo">⚡</div>
    <div class="title">Знания.<span class="text-primary">КИПО</span></div>
</a>

<style>
    .header {
        display: flex;
        align-items: center;
        gap: 10px;

        padding: 12px;

        text-decoration: none;
        color: var(--color-text);
    }

    .logo {
        width: 36px;
        height: 36px;

        border-radius: 12px;
        background: var(--color-primary-subtle);

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .title {
        font-weight: 700;
        font-size: 14px;
    }

    @media (min-width: 1100px) {
        .title {
            display: block;
        }
    }
</style>
