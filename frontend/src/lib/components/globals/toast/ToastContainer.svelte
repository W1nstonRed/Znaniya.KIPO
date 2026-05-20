<script lang="ts">
    import { toasts } from '../../../stores/toast.svelte'
    import ToastItem from './ToastItem.svelte'
</script>

<div class="toast-container">
    {#each toasts.items as toast (toast.id)}
        <ToastItem {toast} />
    {/each}
</div>

<style>
    .toast-container {
        position: fixed;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;

        bottom: 24px;
        right: 24px;
        width: 380px;
    }

    @media (max-width: 480px) {
        .toast-container {
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            padding: 0 0 8px;
        }
    }
</style>
