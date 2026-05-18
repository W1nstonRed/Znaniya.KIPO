<script lang="ts">
    import Tab from '$lib/ui/Tab.svelte'
    import Tabs from '$lib/ui/Tabs.svelte'
    import LoginForm from './LoginForm.svelte'
    import RegisterForm from './RegisterForm.svelte'
</script>

<div class="glass w-full p-6 pb-6">
    <Tabs>
        <Tab label="Авторизация" value="tab-auth">
            <LoginForm />
        </Tab>
        <Tab label="Регистрация" value="tab-reg">
            <RegisterForm />
        </Tab>
    </Tabs>
</div>
