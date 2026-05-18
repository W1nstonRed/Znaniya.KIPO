export const load = async ({ locals }) => {
    console.log('load', locals.user)
    return {
        user: locals.user,
    }
}
