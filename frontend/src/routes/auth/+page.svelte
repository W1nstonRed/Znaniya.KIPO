<script>
    import LoginForm from '$lib/components/auth/LoginForm.svelte'
    import Tab from '$lib/ui/Tab.svelte'
    import Tabs from '$lib/ui/Tabs.svelte'
</script>

<svelte:head>
    <title>Знания.КИПО | Авторизация</title>
</svelte:head>

<div class="flex min-h-dvh items-center justify-center">
    <div class="glass-card p-10">
        <div class="header my-5 text-center">
            <div class="text-2xl font-bold">
                Знания.<span class="text-primary">КИПО</span>
            </div>
            <span class="text-muted">Добро пожаловать</span>
        </div>
        <Tabs>
            <div class="mt-10"></div>
            <Tab label="Авторизация" value="auth-tab-1">
                <LoginForm />
            </Tab>
            <Tab label="Регистрация" value="auth-tab-2">
                <p>tab register</p>
            </Tab>
        </Tabs>
    </div>
</div>
