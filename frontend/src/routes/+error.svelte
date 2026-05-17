<script lang="ts">
    import { goto } from '$app/navigation'
    import { resolve } from '$app/paths'
    import { page } from '$app/state'

    const status = page.status
    const message = page.error?.message

    const errors: Record<number, { badge: string; msg: string; sub: string }> = {
        404: {
            badge: 'page not found',
            msg: 'Упс, такой страницы нет',
            sub: 'Эта страница не существует или была удалена.',
        },
        500: {
            badge: 'server error',
            msg: 'Что-то пошло не так',
            sub: 'Сервер временно недоступен.',
        },
    }

    const data = errors[status] ?? {
        badge: 'unknown error',
        msg: 'Неизвестная ошибка',
        sub: message ?? '',
    }
</script>

<div class="flex h-full w-full items-center justify-center">
    <div class="error-content">
        <div class="status-badge">
            <span class="dot"></span>
            <span>{data.badge}</span>
        </div>
        <h1 class="error-code">{status}</h1>
        <p class="error-msg">{data.msg}</p>
        <p class="error-sub">{data.sub}</p>
        <div class="error-actions flex flex-col items-center justify-center md:flex-row">
            <button class="btn btn-primary" onclick={() => history.back()}>← назад</button>
            <button class="btn btn-ghost" onclick={() => goto(resolve('/'))}>на главную</button>
        </div>
    </div>
</div>
