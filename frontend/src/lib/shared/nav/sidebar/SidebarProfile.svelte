<script lang="ts">
    import { page } from '$app/state'
    import { goto } from '$app/navigation'
    import { resolve } from '$app/paths'
    import { UserCircle } from '@lucide/svelte'

    let user = $derived(page.data.user)
    let open = $state(false)

    let fits = $state(true)

    function checkHeight(node: HTMLElement) {
        const update = () => {
            fits = node.offsetHeight > 120
        }

        update()
        window.addEventListener('resize', update)

        return {
            destroy() {
                window.removeEventListener('resize', update)
            },
        }
    }
</script>

<div use:checkHeight class="profile">
    {#if fits}
        <!-- INLINE PROFILE -->
        <div class="profile-inline">
            <UserCircle size={32} />
            {#if user}
                <div class="meta">
                    <div class="name">{user.fullName}</div>
                </div>
            {/if}
        </div>
    {:else}
        <!-- POPOVER MODE -->
        <button class="profile-btn" onclick={() => (open = !open)}>
            <UserCircle size={20} />
        </button>

        {#if open}
            <div class="popover">
                {#if user}
                    <div class="user">{user.fullName}</div>
                    <button onclick={() => goto(resolve('/auth/logout'))}> Выйти </button>
                {:else}
                    <button onclick={() => goto(resolve('/auth'))}> Войти </button>
                {/if}
            </div>
        {/if}
    {/if}
</div>

<style>
    .profile {
        margin-top: auto;
        padding: 12px;
    }

    .profile-inline {
        display: flex;
        align-items: center;
        gap: 10px;

        padding: 10px;

        border-radius: 12px;

        background: rgba(255, 255, 255, 0.05);
    }

    .profile-btn {
        width: 44px;
        height: 44px;

        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .popover {
        position: absolute;
        bottom: 60px;

        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(10px);

        padding: 12px;
        border-radius: 12px;
    }
</style>
