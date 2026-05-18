<script>
    import { page } from '$app/state'
    import LoginForm from '$lib/components/auth/components/LoginForm.svelte'
    import AnimateComponent from '$lib/shared/animate-component/AnimateComponent.svelte'
    import { toasts } from '$lib/shared/toast/toast.svelte'
    import Surface from '$lib/ui/Surface.svelte'
    import { onMount } from 'svelte'

    onMount(() => {
        if (page.url.searchParams.get('reason') === 'unauthorized') {
            toasts.warning('Отказано в доступе', 'Для посещения страницы, необходима авторизация')
        }
    })
</script>

<div class="flex h-full w-full items-center justify-center">
    <div class="flex w-full flex-col gap-6 md:w-[50%]">
        <AnimateComponent>
            <div class="glass p-6 text-center text-muted">
                <div class="header-text">
                    Добро пожаловать в <span class="text-lg text-foreground"
                        >Знания.<span class="text-primary">КИПО</span></span
                    >
                </div>
            </div>
        </AnimateComponent>
        <div class="flex w-full flex-1 flex-col gap-6 md:flex-row">
            <AnimateComponent>
                <Surface variant="purple" class="w-full">
                    <span>Авторизация</span>
                    <LoginForm />
                </Surface>
            </AnimateComponent>
            <AnimateComponent>
                <div class="features glass flex flex-col gap-6 p-6">
                    <Surface variant="orange">
                        <div class="text-2xl">test message</div>
                    </Surface>

                    <Surface variant="orange">
                        <div class="">test message</div>
                    </Surface>

                    <Surface variant="orange">
                        <div class="text-2xl">test message</div>
                    </Surface>
                </div>
            </AnimateComponent>
        </div>
    </div>
</div>
