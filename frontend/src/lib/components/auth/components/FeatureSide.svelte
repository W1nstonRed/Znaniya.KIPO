<script>
    import Surface from '$lib/ui/Surface.svelte'
    import { FEATURE_ITEMS } from '../features.config'
</script>

<div class="flex flex-col gap-2">
    {#each FEATURE_ITEMS as feature (feature.id)}
        <Surface class="hover:shadow-glow hover:shadow-primary-hover">
            <div class="group flex items-center gap-2 p-4 text-sm">
                <div class="rounded-full bg-primary/40 p-2 group-hover:bg-primary/80">
                    <feature.icon />
                </div>
                <div class="wrapper">
                    <div class="text-md">{feature.title}</div>
                    <div class="text-muted">{feature.description}</div>
                </div>
            </div>
        </Surface>
    {/each}
</div>
