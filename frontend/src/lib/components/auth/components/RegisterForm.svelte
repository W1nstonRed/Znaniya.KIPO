<script lang="ts">
    import { goto } from '$app/navigation'
    import { resolve } from '$app/paths'
    import Button from '$lib/ui/Button.svelte'
    import Form from '$lib/ui/Form.svelte'
    import FormField from '$lib/ui/FormField.svelte'
    import Input from '$lib/ui/Input.svelte'

    type Role = 'STUDENT' | 'TEACHER'

    interface FormValues {
        username: string
        password: string
        fullName: string
        role: Role
        groupId: string
    }

    const initialValues: FormValues = {
        username: '',
        password: '',
        fullName: '',
        role: 'STUDENT',
        groupId: '',
    }

    let role = $state<Role>('STUDENT')
    let serverError = $state('')

    async function submit(values: Record<string, any>): Promise<void | Record<string, string>> {
        serverError = ''

        const body: Record<string, string> = {
            username: values.username,
            password: values.password,
            fullName: values.fullName,
            role: values.role,
        }

        if (values.role === 'STUDENT') {
            body.groupId = values.groupId
        }

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body),
        })

        const data = await res.json()

        if (!res.ok) {
            const code = data?.error?.code

            if (code === 'USERNAME_TAKEN') {
                return { username: 'Имя пользователя уже занято' }
            }
            if (code === 'GROUP_NOT_FOUND') {
                return { groupId: 'Группа не найдена' }
            }

            serverError = data?.error?.message ?? 'Ошибка регистрации'
            return
        }

        goto(resolve('/'))
    }

    function onRoleChange(v: string) {
        role = v as Role
    }
</script>

<Form {initialValues} onSubmit={submit}>
    <FormField name="role" label="Роль">
        {#snippet children({ form })}
            <div class="flex gap-2">
                {#each [['STUDENT', 'Студент'], ['TEACHER', 'Преподаватель']] as [val, label] (val)}
                    <button
                        type="button"
                        class="h-11 flex-1 rounded-xl border text-sm font-medium transition-all duration-200
                            {role === val
                            ? 'border-primary/50 bg-primary/15 text-primary'
                            : 'border-white/8 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/70'}"
                        onclick={() => {
                            onRoleChange(val)
                            role = val as Role
                            form.setValue('role', val)
                        }}
                    >
                        {label}
                    </button>
                {/each}
            </div>
        {/snippet}
    </FormField>

    <FormField name="fullName" label="ФИО">
        <Input name="fullName" placeholder="Иванов Иван Иванович" fullWidth />
    </FormField>

    <FormField name="username" label="Имя пользователя">
        <Input name="username" placeholder="введите username" fullWidth />
    </FormField>

    <FormField name="password" label="Пароль">
        <Input name="password" type="password" placeholder="введите пароль" fullWidth />
    </FormField>

    {#if role === 'STUDENT'}
        <FormField name="groupId" label="ID группы">
            <Input name="groupId" placeholder="введите ID группы" fullWidth />
        </FormField>
    {/if}

    {#if serverError}
        <p class="text-xs text-danger/80">{serverError}</p>
    {/if}

    <Button size="md" variant="primary" type="submit" fullWidth>Зарегистрироваться</Button>
</Form>
