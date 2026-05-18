export type Values = Record<string, any>
export type Errors = Record<string, string>

export function createFormStore(initial: Values = {}) {
    const values = $state<Values>({ ...initial })
    const errors = $state<Errors>({})
    let isSubmitting = $state(false)

    function setValue(name: string, value: any) {
        values[name] = value
    }

    function setError(name: string, message: string) {
        errors[name] = message
    }

    function clearError(name: string) {
        delete errors[name]
    }

    function reset() {
        for (const key of Object.keys(values)) delete values[key]
        Object.assign(values, initial)
        for (const key of Object.keys(errors)) delete errors[key]
    }

    async function handleSubmit(cb: (values: Values) => void | Errors | Promise<void | Errors>) {
        isSubmitting = true
        for (const key of Object.keys(errors)) delete errors[key]
        try {
            const result = await cb({ ...values })
            if (result && typeof result === 'object') {
                Object.assign(errors, result)
            }
        } finally {
            isSubmitting = false
        }
    }

    return {
        get values() {
            return values
        },
        get errors() {
            return errors
        },
        get isSubmitting() {
            return isSubmitting
        },
        setValue,
        setError,
        clearError,
        reset,
        handleSubmit,
    }
}
