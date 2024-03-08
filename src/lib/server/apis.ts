import type {APIRoute} from '../../ambient';
import type {RequestEvent} from '@sveltejs/kit';
import {putObj} from "$lib/server/r2";

export const Apis: APIRoute = {
    test: {
        GET() {
            return 'hello world';
        }
    },
    upload: {
        async POST(event: RequestEvent) {
            const form = await event.request.formData()
            const file = form.get('file') as File
            if (file) return await putObj(file)
        }
    }
};
