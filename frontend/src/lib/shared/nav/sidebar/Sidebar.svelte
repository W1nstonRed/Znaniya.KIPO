<script lang="ts">
    import SideBarHeader from './SidebarHeader.svelte'
    import SidebarNav from './SidebarNav.svelte'
    import SidebarProfile from './SidebarProfile.svelte'
</script>

<div class="flex h-full w-full items-center justify-center px-3">
    <div class="sidebar-inner">
        <SideBarHeader />
        <SidebarNav />
        <SidebarProfile />
    </div>
</div>

<style>
    .sidebar-inner {
        min-height: calc(var(--spacing) * 200);
        width: 100%;

        display: flex;
        flex-direction: column;
        justify-content: space-between;

        padding: 8px;
        border-radius: var(--radius-md);

        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(8px);
    }
</style>
