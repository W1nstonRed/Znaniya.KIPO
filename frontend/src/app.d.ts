// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
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

export {};
