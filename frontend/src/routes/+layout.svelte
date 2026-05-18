<script>
    import '../styles/layout.css'
    import ToastContainer from '$lib/shared/toast/ToastContainer.svelte'
    let { children } = $props()
</script>

<div class="wrap">
    <div class="bg-grid"></div>
    <div class="wrap-blobs">
        <div class="blob blob1"></div>
        <div class="blob blob2"></div>
    </div>
    {@render children()}
</div>

<ToastContainer />
