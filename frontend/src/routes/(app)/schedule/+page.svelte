<script lang="ts">
    import { page } from '$app/state'
    let user = $derived(page.data.user)
</script>

{#if user}
    <section class="py-10">
        <div class="text-2xl font-bold text-primary">Избранное</div>
        <div class="text-muted">Пока нет фаворитов</div>
    </section>
{/if}

<section class="py-10">
    <div class="py-4 text-2xl text-primary">Все группы</div>
</section>
