import { type HttpMethod } from '@sveltejs/kit';
import type { Apis } from '$lib/server/apis';
import { arr2Str, arrayify, isEmpty, parseArray, ugzip } from '$lib/utils';
import type { CacheConfig } from '../ambient';
import { Caches } from '../cache';
import { ecdh } from '$lib/crypto';
import { browser } from '$app/environment';

export const api = (apiName: keyof typeof Apis) => {
	const baseUrl = 'http://a/api/';
	const controller = new AbortController();
	const query =
		(method: HttpMethod) =>
		<T extends string | number | object | ArrayBuffer>(
			data?: BodyInit | object | unknown[] | undefined
		) => {
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

			type failFn = (reason?: unknown) => void;
			type successFn = (data: T) => void;
			const pmsConnector = {} as {
				success?: successFn;
				fail?: failFn;
			};

			const parseResult = async (r: Response) => {
				const hd = r.headers;
				const contentType = hd.get('content-type');
				let data: Uint8Array | ArrayBuffer | undefined;
				if (contentType === 'application/gzip') data = await ugzip(r.body);
				else data = await r.arrayBuffer();
				if (vi && data) {
					data = await ecdh.dec(data, vi);
					return data && parseArray(new Uint8Array(data));
				}
				if (contentType !== 'application/octet-stream')
					return data && parseArray(new Uint8Array(data));
				return data;
			};
			let cacheCfg: CacheConfig | undefined;
			let cacheKey = '';
			let vi = 0;
			const pms = Promise.resolve().then(async () => {
				const url = new URL(baseUrl + apiName);
				const tp = typeof data;
				if (data) {
					if (vi) data = new Uint8Array(await ecdh.enc(new Uint8Array(arrayify(data)), vi));
					if (method === 'GET' || method === 'DELETE') {
						if (vi) {
							url.search = encodeURIComponent(String.fromCharCode(...(data as Uint8Array)));
						} else if (tp === 'number' || tp === 'string') {
							url.search = data as string;
						} else
							Object.entries(data as object).forEach(([k, v]) => {
								url.searchParams.append(k.toString(), v.toString());
							});
					} else {
						if (
							/Stream$|Buffer$|\dArray$|^String|^Number$|^FormData$/.test(data.constructor.name)
						) {
							opt.body = data as BodyInit;
						} else {
							opt.body = Uint8Array.from(arrayify(data));
						}
					}
				}

				const u = url.toString().slice(8);
				if (cacheCfg) {
					const k = cacheCfg.key;
					if (k) {
						if (typeof k === 'string') cacheKey = k;
						else cacheKey = k();
					} else cacheKey = opt.method[1] + apiName + (data ? arr2Str(arrayify(data)) : '');
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
				use: (cfg: {
					encrypt?: boolean;
					headers?: { [key: string]: string };
					cache?: CacheConfig;
				}) => typeof pms;
				abort: () => void;
				success: (fn: successFn) => typeof pms;
				fail: (fn: failFn) => typeof pms;
			};

			pms.use = ({ encrypt, headers: h, cache }) => {
				if (browser && encrypt) {
					vi = (Math.random() * 1e8) << 0;
					headers.set('x-vi', vi.toString(36));
				}
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
