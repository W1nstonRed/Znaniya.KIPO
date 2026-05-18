<script lang="ts">
    import { authApi } from '$lib/api/auth/client'
    import { ApiError } from '$lib/api/client/errors'
    import { goto, invalidateAll } from '$app/navigation'
    import Input from '$lib/ui/Input.svelte'
    import { resolve } from '$app/paths'
    import Form from '$lib/ui/Form.svelte'
    import FormField from '$lib/ui/FormField.svelte'
    import Button from '$lib/ui/Button.svelte'
    import { toasts } from '$lib/shared/toast/toast.svelte'

    async function submit(values: Record<string, any>) {
        const { username, password } = values
        console.log('submit', values)
        if (!username.trim() || !password) return
        try {
            await authApi.login({ username, password })
            await invalidateAll()
            goto(resolve('/'))
        } catch (e) {
            if (e instanceof ApiError) {
                switch (e.code) {
                    case 'INVALID_CREDENTIALS':
                        return { username: e.message, password: e.message }
                    case 'NETWORK_ERROR':
                        toasts.error('Нет соединения с сервером')
                        break
                    default:
                        toasts.error(e.message)
                }
            } else {
                toasts.error('Неизвестная ошибка')
            }
        }
    }
</script>

<Form initialValues={{ username: '', password: '' }} onSubmit={submit}>
    <FormField name="username" label="Имя пользователя">
        <Input name="username" placeholder="введите username" fullWidth />
    </FormField>
    <FormField name="password" label="Пароль">
        <Input name="password" type="password" placeholder="введите пароль" fullWidth />
    </FormField>
    <Button size="md" variant="primary" type="submit" fullWidth>Войти</Button>
</Form>
