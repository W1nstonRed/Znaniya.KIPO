<script>
    import { goto } from '$app/navigation'
    import { resolve } from '$app/paths'
    import { page } from '$app/state'
    import Button from '$lib/ui/Button.svelte'
    import Surface from '$lib/ui/Surface.svelte'
    import { DoorClosed, UserCircle } from '@lucide/svelte'

    let user = $derived(page.data.user)
</script>

{#if user}
    <div class="flex flex-col">
        <div class="icon flex items-center justify-center text-primary">
            <UserCircle size={100} />
        </div>
        <div class="user-data flex flex-col text-center">
            <span class="text-muted">Добро пожаловать</span>
            <span class="text-lg text-foreground">{user.fullName}</span>
        </div>
        <div class="py-5"></div>
        <div>
            <Surface class="p-2">
                <div class="flex w-full items-center justify-around">
                    <Button variant="icon"><DoorClosed size={20} /></Button>
                    <Button variant="icon"><DoorClosed size={20} /></Button>
                    <Button variant="icon"><DoorClosed size={20} /></Button>
                    <Button
                        onClick={() => {
                            goto(resolve('/auth/logout'))
                        }}
                        variant="danger"><DoorClosed size={20} /></Button
                    >
                </div>
            </Surface>
        </div>
    </div>
{:else}
    <div class="pb-5 text-center font-bold text-muted">
        Для просмотра профиля необходима авторизация
    </div>
    <Button
        fullWidth={true}
        onClick={() => {
            goto(resolve('/auth'))
        }}
        variant="primary">Авторизация</Button
    >
{/if}
