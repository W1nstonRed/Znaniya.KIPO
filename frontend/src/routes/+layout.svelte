<script lang="ts">
    import ToastContainer from '$lib/components/globals/toast/ToastContainer.svelte'
    import '../styles/layout.css'

    let { children } = $props()
</script>

<div class="min-h-dvh">
    {@render children()}
</div>

<ToastContainer />
