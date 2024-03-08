// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type {PlatformEnv} from "./ambient";
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        interface PageData {}
        // interface PageState {}
        // interface Platform {}
		interface Platform {
			env: PlatformEnv
			context?: {
				waitUntil(promise: Promise<never>): void;
			};
			caches?: CacheStorage & { default: Cache }
		}
    }
}

export {};
