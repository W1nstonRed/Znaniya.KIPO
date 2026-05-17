<script lang="ts">
    import '../styles/layout.css'
    import favicon from '$lib/assets/favicon.svg'
    import ToastContainer from '$lib/shared/toast/ToastContainer.svelte'

    let { children } = $props()
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<div class="wrap">
    <div class="app-container">
        <div class="page-container">
            <div class="bg-grid"></div>
            <div class="blob blob1"></div>
            <div class="blob blob2"></div>
            {@render children()}
        </div>
    </div>
</div>

<ToastContainer />
