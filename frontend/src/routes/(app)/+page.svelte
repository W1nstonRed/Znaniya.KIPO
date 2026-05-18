<script>
    import { goto } from '$app/navigation'
    import { resolve } from '$app/paths'
    import { page } from '$app/state'
    import Button from '$lib/ui/Button.svelte'

    let user = $derived(page.data.user)
</script>

<Button
    onClick={() => {
        goto(resolve('/auth'))
    }}
    variant="primary"
>
    К Авторизации
</Button>

{#if user}
    <Button
        onClick={() => {
            goto(resolve('/auth/logout'))
        }}
        variant="primary"
    >
        Выйти {user.username}
    </Button>
{/if}
