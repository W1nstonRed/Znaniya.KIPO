import { redirect } from '@sveltejs/kit'

export const GET = async ({ cookies }) => {
    cookies.delete('auth_token', { path: '/' })
    cookies.delete('refresh_token', { path: '/' })
    throw redirect(303, '/auth')
}
