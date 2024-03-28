import { browser } from '$app/environment';
import { arrayify, parseArray } from '$lib/utils';

const CACHE = `ooo`;

export const Caches = (() => {
	let cache: Cache | undefined;
	const keyPath = '/cache/keys';
	let keys: string[] | undefined;

	const getCache = async (key: string) => {
		const r = await cache?.match(key);
		if (r) {
			const exp = Date.parse(r.headers.get('expire') || '');
			if (!exp || exp < Date.now()) {
				removeCache(key).then();
				return null;
			}
			return parseArray(new Uint8Array(await r.arrayBuffer()));
		}
	};

	const loadKeys = async () => {
		if (!keys) {
			const r = await getCache(keyPath);
			if (r) {
				keys = r as string[];
			} else keys = [];
		}
		return keys;
	};

	const saveKeys = async (key: string) => {
		await loadKeys();
		if (keys?.indexOf(key) === -1) {
			keys.push(key);
			await cache?.put(keyPath, new Response(new Uint8Array(arrayify(keys))));
		}
	};

	const removeCache = async (key: string) => {
		await cache?.delete(key);
		if (keys) {
			const i = keys.indexOf(key);
			if (i !== -1) keys.splice(i, 1);
		}
	};

	return {
		async delete(key: ((k: string) => boolean) | string) {
			if (typeof key === 'string') await removeCache(key);
			else {
				await Promise.all(
					(keys as []).map(async (k) => {
						if (key(k)) await removeCache(k);
					})
				);
			}
		},
		get: getCache,
		async put(key: string, resp: Response) {
			if (!browser) return;
			if (!cache) cache = await caches.open(CACHE);
			if (cache) {
				await saveKeys(key);
				await cache.put(key, resp);
			}
		}
	};
})();
