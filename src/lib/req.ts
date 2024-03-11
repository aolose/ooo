import { type HttpMethod } from '@sveltejs/kit';
import type { Apis } from '$lib/server/apis';

export const api = (apiName: keyof typeof Apis) => {
	const baseUrl = 'http://a/api/';
	const controller = new AbortController();
	const query =
		(method: HttpMethod) =>
		<T extends string | number | object | ArrayBuffer>(data?: BodyInit | null | undefined) => {
			const opt: RequestInit = {
				method,
				signal: controller.signal
			};
			const url = new URL(baseUrl + apiName);
			const tp = typeof data;
			if (data) {
				if (method === 'GET' || method === 'DELETE') {
					if (tp === 'number' || tp === 'string') {
						url.search = data as string;
					} else
						Object.entries(data as object).forEach(([k, v]) => {
							url.searchParams.append(k.toString(), v.toString());
						});
				} else {
					if (/Stream$|Buffer$|\dArray$|^String|^Number$|^FormData$/.test(data.constructor.name)) {
						opt.body = data;
					} else opt.body = JSON.stringify(data);
				}
			}

			type failFn = (reason?: unknown) => void;
			type successFn = (data: T) => void;
			const pmsConnector = {} as {
				success?: successFn;
				fail?: failFn;
			};
			const parseResult = async (r: Response): Promise<string | number | ArrayBuffer | object> => {
				const d = r.headers.get('x-data-type');
				switch (d) {
					case 'num':
						return +(await r.text());
					case 'bin':
						return await r.arrayBuffer();
					case 'json':
						return await r.json();
				}
				return await r.text();
			};
			const pms = fetch(url.toString().slice(8), opt)
				.then(parseResult)
				.then((data) => {
					if (pmsConnector.success) pmsConnector.success(data as T);
					return data as T;
				})
				.catch((reason) => {
					if (pmsConnector.fail) pmsConnector.fail(reason);
					console.error(reason);
				}) as Promise<T> & {
				abort: () => void;
				success: (fn: successFn) => typeof pms;
				fail: (fn: failFn) => typeof pms;
			};

			pms.abort = () => {
				controller.abort();
			};
			pms.success = (fn) => {
				pmsConnector.success = fn;
				return pms;
			};
			pms.fail = (fn) => {
				pmsConnector.fail = fn;
				return pms;
			};
			return pms;
		};
	return {
		get: query('GET'),
		post: query('POST'),
		delete: query('DELETE'),
		put: query('PUT')
	};
};
