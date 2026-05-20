<script lang="ts">
    import { createFormStore } from '$lib/stores/ui/form.svelte'
    import { setContext, untrack, type Snippet } from 'svelte'

    type Values = Record<string, any>
    type Errors = Record<string, string>

    interface Props {
        initialValues?: Values
        onSubmit: (values: Values) => void | Errors | Promise<void | Errors>
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
