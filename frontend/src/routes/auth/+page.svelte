<script>
    import { page } from '$app/state'
    import { toasts } from '$lib/shared/toast/toast.svelte'
    import { onMount } from 'svelte'
    import AuthHeader from '$lib/components/auth/components/AuthHeader.svelte'
    import LeftSide from '$lib/components/auth/components/LeftSide.svelte'
    import FeatureSide from '$lib/components/auth/components/FeatureSide.svelte'

    onMount(() => {
        if (page.url.searchParams.get('reason') === 'unauthorized') {
            toasts.warning('Отказано в доступе', 'Для посещения страницы, необходима авторизация')
        }
    })
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-2">
    <div class="glass flex w-[75%] items-center justify-center p-6">
        <AuthHeader />
    </div>
    <div class="flex w-[75%] flex-col gap-2 md:flex-row">
        <LeftSide />
        <div class="glass w-full p-6">
            <FeatureSide />
        </div>
    </div>
</div>
