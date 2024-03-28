import { type HttpMethod } from '@sveltejs/kit';
import type { Apis } from '$lib/server/apis';
import { arrayify, isEmpty, parseArray, ugzip } from '$lib/utils';
import type { CacheConfig } from '../ambient';
import { Caches } from '../cache';

export const api = (apiName: keyof typeof Apis) => {
	const baseUrl = 'http://a/api/';
	const controller = new AbortController();
	const query =
		(method: HttpMethod) =>
		<T extends string | number | object | ArrayBuffer>(data?: unknown) => {
			const headers = new Headers();
			headers.set('Content-Type', 'application/octet-stream');
			/**
			 *  fetch duplex
			 *  @see {@link https://fetch.spec.whatwg.org/#dom-requestinit-duplex}
			 *  */
			const opt: RequestInit & { method: string; duplex: 'half' | 'full' } = {
				method,
				signal: controller.signal,
				headers: headers,
				duplex: 'half'
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
						opt.body = data as BodyInit;
					} else {
						opt.body = Uint8Array.from(arrayify(data));
					}
				}
			}

			type failFn = (reason?: unknown) => void;
			type successFn = (data: T) => void;
			const pmsConnector = {} as {
				success?: successFn;
				fail?: failFn;
			};

			const parseResult = async (r: Response) => {
				const hd = r.headers;
				const contentType = hd.get('content-type');
				if (contentType === 'application/octet-stream') return await r.arrayBuffer();
				else if (contentType === 'application/gzip') return await ugzip(r.body);
				const bf = await r.arrayBuffer();
				return parseArray(new Uint8Array(bf));
			};
			let cacheCfg: CacheConfig | undefined;
			let cacheKey = '';
			const pms = Promise.resolve().then(async () => {
				const u = url.toString().slice(8);

				if (cacheCfg) {
					const k = cacheCfg.key;
					if (k) {
						if (typeof k === 'string') cacheKey = k;
						else cacheKey = k();
					} else
						cacheKey =
							opt.method[1] + apiName + (data ? String.fromCharCode(...arrayify(data)) : '');
					const r = await Caches.get(cacheKey);
					if (r) {
						if (pmsConnector.success) pmsConnector.success(r as T);
						return r;
					}
				}

				return fetch(u, opt)
					.then(parseResult)
					.then((data) => {
						if (cacheKey && !isEmpty(data)) {
							const headers = new Headers();
							headers.set(
								'expire',
								new Date(Date.now() + (cacheCfg?.expire || 60) * 1e3).toUTCString()
							);
							Caches.put(
								cacheKey,
								new Response(new Uint8Array(arrayify(data as T)), {
									headers
								})
							);
						}
						if (pmsConnector.success) pmsConnector.success(data as T);
						return data as T;
					})
					.catch((reason) => {
						if (pmsConnector.fail) pmsConnector.fail(reason);
						console.error(reason);
					});
			}) as Promise<T> & {
				use: (cfg: { headers?: { [key: string]: string }; cache?: CacheConfig }) => typeof pms;
				abort: () => void;
				success: (fn: successFn) => typeof pms;
				fail: (fn: failFn) => typeof pms;
			};

			pms.use = ({ headers: h, cache }) => {
				if (h)
					for (const [k, v] of Object.entries(h)) {
						headers.set(k, v);
					}
				if (cache) cacheCfg = cache;
				return pms;
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

export const clearCache = () => {};
