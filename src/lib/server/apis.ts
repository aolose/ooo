import type { APIRoute } from '../../ambient';
import type { RequestEvent } from '@sveltejs/kit';
import { storage } from '$lib/server/storage';

let a = 1;
export const Apis: APIRoute = {
	ok: {
		GET() {
			return storage.bucket ? a++ : 0;
		}
	},
	test: {
		GET() {
			return 'hello world';
		}
	},
	files: {
		DELETE(e: RequestEvent) {
			const key = e.url.search.slice(1);
			if (key) return storage.bucket?.del(key);
		},
		GET() {
			return storage.bucket?.list();
		},
		async POST(event: RequestEvent) {
			const form = await event.request.formData();
			const file = form.get('file') as File;
			if (file) return storage.bucket?.put(file);
		}
	}
};
