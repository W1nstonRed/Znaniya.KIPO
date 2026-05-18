<script>
    import { goto } from '$app/navigation'
    import { resolve } from '$app/paths'
    import { page } from '$app/state'
    import { api } from '$lib/api/client/client'
    import Button from '$lib/ui/Button.svelte'

    let user = $derived(page.data.user)

    async function testPush() {
        try {
            await api.post('/push/test')
            console.log('Push отправлен')
        } catch (e) {
            console.error('Ошибка:', e)
        }
    }
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
    <button onclick={testPush}>test</button>

    <Button
        onClick={() => {
            goto(resolve('/auth/logout'))
        }}
        variant="primary"
    >
        Выйти {user.username}
    </Button>
{/if}
