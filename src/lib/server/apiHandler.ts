import { error, type RequestEvent } from '@sveltejs/kit';
import { Apis } from '$lib/server/apis';
import { resp } from '$lib/server/utils';

export const apiHandler = async (event: RequestEvent) => {
	const path = event.url.pathname.substring(5) as keyof typeof Apis;
	const api = Apis[path];
	const method = api[event.request.method as keyof typeof api];
	if (!method) return new Response('', { status: 404 });
	try {
		const res = await method(event);
		if (res instanceof Response) return res;
		return await resp(res);
	} catch (e) {
		return error(500, `${e}`);
	}
};
