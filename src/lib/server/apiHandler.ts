import { error, type RequestEvent } from '@sveltejs/kit';
import { Apis } from '$lib/server/apis';
import { resp } from '$lib/server/utils';
import { ecdh } from '$lib/crypto';
import { arrayify, parseArray } from '$lib/utils';

export const apiHandler = async (event: RequestEvent) => {
	const path = event.url.pathname.substring(5) as keyof typeof Apis;
	const api = Apis[path];
	const method = api[event.request.method as keyof typeof api];
	if (!method) return new Response('', { status: 404 });
	try {
		const req = event.request;
		const mt = req.method;
		const url = event.url;
		const viStr = req.headers.get('x-vi');
		const viNum = viStr ? parseInt(viStr, 36) : 0;
		let data: ArrayBuffer | string | undefined;
		if (viNum) {
			if (mt === 'GET' || mt === 'DELETE') {
				const d = url.search.slice(1);
				if (d) {
					const str = decodeURIComponent(d);
					const raw = Uint8Array.from(str, (a) => a.charCodeAt(0));
					data = parseArray(new Uint8Array(await ecdh.dec(raw, viNum)));
				}
			} else {
				const bf = await req.arrayBuffer();
				if (bf.byteLength) {
					data = parseArray(new Uint8Array(await ecdh.dec(bf, viNum)));
				}
			}
		} else {
			if (mt === 'GET' || mt === 'DELETE') {
				data = url.search.slice(1);
			} else {
				data = await req.arrayBuffer();
			}
		}

		let res = await method({
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-expect-error
			data,
			headers: req.headers
		});
		if (res instanceof Response) return res;
		if (res && viNum) res = await ecdh.enc(new Uint8Array(arrayify(res)), viNum);
		return await resp(res);
	} catch (e) {
		console.error(e);
		return error(500, `${e}`);
	}
};
