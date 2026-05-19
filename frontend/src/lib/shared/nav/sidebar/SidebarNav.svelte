<script lang="ts">
    import { page } from '$app/state'
    import { resolve } from '$app/paths'
    import { NAV_ITEMS } from '../items.config'

    let user = $derived(page.data.user)
    const visibleItems = $derived(user ? NAV_ITEMS : NAV_ITEMS.filter(i => !i.authOnly))
    let current = $derived(page.url.pathname)
</script>

<nav class="nav">
    {#each visibleItems as item (item.id)}
        <a href={resolve(item.href as any)} class="item" class:active={current === item.href}>
            <item.icon size={20} />
            <span class="label">{item.label}</span>
        </a>
    {/each}
</nav>

<style>
    .nav {
        display: flex;
        flex-direction: column;
        gap: 6px;

        padding: 8px;
    }

    .item {
        display: flex;
        align-items: center;
        gap: 12px;

        padding: 10px 12px;

        border-radius: 12px;

        color: var(--color-muted);
        text-decoration: none;

        transition: 0.2s;
    }

    .item:hover {
        background: rgba(255, 255, 255, 0.08);
    }

    .item.active {
        background: var(--color-primary-subtle);
        color: var(--color-primary);
    }

    @media (min-width: 1100px) {
        .label {
            display: block;
        }
    }
</style>
