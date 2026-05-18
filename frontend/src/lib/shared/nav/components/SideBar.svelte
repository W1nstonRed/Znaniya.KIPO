<script lang="ts">
    import { page } from '$app/state'
    import { resolve } from '$app/paths'
    import { goto } from '$app/navigation'
    import { NAV_ITEMS } from '../items.config'
    import { UserCircle, DoorClosed } from '@lucide/svelte'
    import Button from '$lib/ui/Button.svelte'
    import Surface from '$lib/ui/Surface.svelte'

    let user = $derived(page.data.user)
    const visibleItems = $derived(user ? NAV_ITEMS : NAV_ITEMS.filter(i => !i.authOnly))

    let currentPath = $derived(page.url.pathname)
    let open = $state(false)
    let profileOpen = $state(false)

    function onMouseLeave() {
        open = false
        profileOpen = false
    }
</script>

<div
    class="trigger-zone"
    onmouseenter={() => (open = true)}
    onmouseleave={onMouseLeave}
    role="presentation"
>
    <!-- закрытый: столбик круглых кнопок -->
    <div class="pills" class:hidden={open}>
        <div class="pills-nav">
            {#each visibleItems as item (item.id)}
                <a
                    href={resolve(item.href as any)}
                    class="pill-btn"
                    class:active={currentPath === item.href}
                    aria-label={item.label}
                >
                    <item.icon size={20} strokeWidth={currentPath === item.href ? 2.25 : 1.75} />
                </a>
            {/each}
        </div>
        <button class="pill-btn" aria-label="Профиль">
            <UserCircle size={20} strokeWidth={1.75} />
        </button>
    </div>

    <!-- открытый sidebar -->
    <aside class="sidebar" class:open>
        <nav class="sidebar-nav">
            {#each visibleItems as item (item.id)}
                <a
                    href={resolve(item.href as any)}
                    class="sidebar-item"
                    class:active={currentPath === item.href}
                    aria-label={item.label}
                >
                    <span class="icon">
                        <item.icon
                            size={20}
                            strokeWidth={currentPath === item.href ? 2.25 : 1.75}
                        />
                    </span>
                    <span class="sidebar-label">{item.label}</span>
                </a>
            {/each}
        </nav>

        <!-- кнопка профиля + popover -->
        <div class="profile-wrap">
            <!-- popover -->
            <div class="popover" class:visible={profileOpen}>
                {#if user}
                    <div class="flex items-center justify-center pb-2 text-primary">
                        <UserCircle size={56} />
                    </div>
                    <div class="flex flex-col pb-3 text-center">
                        <span style="font-size:11px; color: var(--color-muted)"
                            >Добро пожаловать</span
                        >
                        <span style="font-size:14px; color: var(--color-text)">{user.fullName}</span
                        >
                    </div>
                    <div class="flex w-full items-center justify-around">
                        <Button variant="icon"><DoorClosed size={16} /></Button>
                        <Button variant="icon"><DoorClosed size={16} /></Button>
                        <Button variant="icon"><DoorClosed size={16} /></Button>
                        <Button onClick={() => goto(resolve('/auth/logout'))} variant="danger"
                            ><DoorClosed size={16} /></Button
                        >
                    </div>
                {:else}
                    <div
                        style="font-size:12px; color: var(--color-muted); text-align:center; padding-bottom:12px"
                    >
                        Необходима авторизация
                    </div>
                    <Button
                        fullWidth={true}
                        onClick={() => goto(resolve('/auth'))}
                        variant="primary"
                    >
                        Войти
                    </Button>
                {/if}
            </div>

            <button
                class="sidebar-item"
                class:active={profileOpen}
                onclick={() => (profileOpen = !profileOpen)}
                aria-label="Профиль"
            >
                <span class="icon">
                    <UserCircle size={20} strokeWidth={1.75} />
                </span>
                <span class="sidebar-label">
                    {user ? user.fullName?.split(' ')[0] : 'Профиль'}
                </span>
            </button>
        </div>
    </aside>
</div>

<style>
    .trigger-zone {
        position: fixed;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        height: 75dvh;
        width: 220px;
        z-index: 30;
        display: flex;
        align-items: center;
        padding-left: 10px;
    }

    .pills {
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        opacity: 1;
        padding: 8px;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.06);
        transition: opacity 0.2s;
    }

    .pills.hidden {
        opacity: 0;
        pointer-events: none;
    }

    .pills-nav {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .pill-btn {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-muted);
        text-decoration: none;
        cursor: pointer;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.07);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        transition:
            background 0.2s,
            color 0.2s;
        flex-shrink: 0;
    }

    .pill-btn:hover {
        background: rgba(255, 255, 255, 0.12);
        color: var(--color-text);
    }

    .pill-btn.active {
        background: var(--color-primary-subtle);
        color: var(--color-primary);
        border-color: oklch(70% 0.18 48 / 0.25);
        box-shadow: 0 0 12px oklch(70% 0.18 48 / 0.15);
    }

    .sidebar {
        position: absolute;
        height: 100%;
        width: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        opacity: 0;
        padding: 0;

        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 28px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

        overflow: visible; /* важно — popover выходит за пределы */
        transition:
            width 0.3s cubic-bezier(0.32, 0.72, 0, 1),
            opacity 0.2s,
            padding 0.3s;
        pointer-events: none;
    }

    .sidebar.open {
        width: 200px;
        opacity: 1;
        padding: 8px;
        pointer-events: all;
    }

    .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: hidden; /* nav обрезается, но profile-wrap нет */
    }

    .profile-wrap {
        position: relative;
        flex-shrink: 0;
    }

    /* popover выезжает вверх над кнопкой */
    .popover {
        position: absolute;
        bottom: calc(100% + 8px);
        left: 0;
        width: max-content;
        min-width: 184px;
        padding: 16px;

        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 50;

        opacity: 0;
        transform: translateY(8px);
        pointer-events: none;
        transition:
            opacity 0.25s cubic-bezier(0.32, 0.72, 0, 1),
            transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);

        /* фон через псевдоэлемент */
        isolation: isolate;
    }

    .popover::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 20px;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        background: rgba(54, 22, 0, 0.5);
        z-index: -1;
    }

    .popover.visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: all;
    }

    .sidebar-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: var(--radius-lg);
        color: var(--color-muted);
        text-decoration: none;
        font-size: 14px;
        white-space: nowrap;
        transition:
            background 0.2s,
            color 0.2s;
        cursor: pointer;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        flex-shrink: 0;
    }

    .sidebar-item:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--color-text);
    }

    .sidebar-item.active {
        background: var(--color-primary-subtle);
        color: var(--color-primary);
        border: 1px solid oklch(70% 0.18 48 / 0.25);
        box-shadow: 0 0 12px oklch(70% 0.18 48 / 0.15);
    }

    .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 20px;
        height: 20px;
    }

    .sidebar-label {
        opacity: 0;
        transform: translateX(-6px);
        transition:
            opacity 0.2s 0.1s,
            transform 0.2s 0.1s;
        pointer-events: none;
    }

    .sidebar.open .sidebar-label {
        opacity: 1;
        transform: translateX(0);
    }
</style>
