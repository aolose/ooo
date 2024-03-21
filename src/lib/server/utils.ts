import { arrayify, gzip } from '$lib/utils';

export const bufHash = async (buf: ArrayBuffer) => {
	const hashBuf = await crypto.subtle.digest('SHA-1', buf);
	return Array.from(new Uint32Array(hashBuf), (a) => a.toString(36)).join('');
};

export const resp =async (
	data: unknown,
	status = 200,
	headers?: Headers | object | Map<string, string>
) => {
	let headers1 = new Headers();
	const opt = {
		status,
		headers: headers1
	};
	if (headers) {
		if (headers instanceof Headers) {
			headers1 = headers;
		} else if (headers instanceof Map) {
			headers.forEach((k, v) => headers1.set(k, v));
		} else Object.entries(headers).forEach(([k, v]) => headers1.set(k.toString(), v.toString()));
	}

	if (data) {
		const type = data.constructor.name;
		if (/Stream$|Buffer$|\dArray$/.test(type)) {
			headers1.set('content-type', 'application/octet-stream');
		} else {
			let arr:Uint8Array|number[] = arrayify(data);
			if (arr.length > 100) {
				arr=await gzip(arr)
				headers1.set('content-encoding','gzip')
				headers1.set('content-length',arr.length.toString())
			}
			data = Uint8Array.from(arr);
		}
	}
	return new Response(data as BodyInit, opt);
};

export const pick = <T>(o: T, ...keys: (keyof typeof o)[]) => {
	const n = {} as typeof o;
	keys.forEach((k) => (n[k] = o[k]));
	return n;
};

export const flatObj = <T extends { [key: symbol | string]: unknown }>(o: T[], keys: string[]) => {
	if (!o.length) return [];
	const data: unknown[] = [];
	o.forEach((s) => {
		keys.forEach((a) => data.push(s[a]));
	});
	return data;
};
