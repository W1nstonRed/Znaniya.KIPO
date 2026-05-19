<script lang="ts">
    import { page } from '$app/state'

    let groups = $derived(page.data.groups)
</script>

{#if groups}
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5">
        {#each groups as group (group.id)}
            <div class="bg-primary p-2">
                {group.name}
            </div>
        {/each}
    </div>
{:else}
    <div class="text-red text-center">Не удалось получить группы</div>
{/if}
