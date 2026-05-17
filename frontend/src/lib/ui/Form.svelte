<script lang="ts">
    import { createFormStore } from '$lib/stores/form.svelte'
    import { setContext, untrack, type Snippet } from 'svelte'

    interface Props {
        initialValues?: Record<string, any>
        onSubmit: (values: any) => void | Promise<void>
        children: Snippet
    }

    const { initialValues = {}, onSubmit, children }: Props = $props()

    const form = untrack(() => createFormStore(initialValues))
    setContext('form', form)

    function submit(e: Event) {
        e.preventDefault()
        form.handleSubmit(onSubmit)
    }
</script>

<form onsubmit={submit} class="flex flex-col gap-6">
    {@render children?.()}
</form>
