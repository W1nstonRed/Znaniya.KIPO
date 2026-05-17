import type { CurrentUser } from '$lib/api/auth/types'

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            user: CurrentUser | null
        }
        interface PageData {
            user: CurrentUser | null
        }
        // interface PageState {}
        // interface Platform {}
    }
}

export {}
