import { browser } from '$app/environment';
import { parseArray } from '$lib/utils';

export const Caches = (() => {
	const CACHE = `ooo`;
	const prefix = 'http://a/';

	let cache: Cache | undefined;
	let keys: string[] | undefined;

	const getCache =async (key:string)=>{
		const r = await cache?.match(prefix + key);
		const exp = Date.parse(r?.headers.get('expire') || '');
		if (!exp || exp < Date.now()) {
			removeCache(key).then();
      return null
		}
		return  r
	}

	const getData = async (key: string) => {
		const r = await getCache(key)
		if (r) {
			return parseArray(new Uint8Array(await r.arrayBuffer()));
		}
	};

	const openCache =async ()=>{
		cache = await caches.open(CACHE);
		await loadKeys()
		keys?.forEach(getCache)
	}

	const loadKeys = async () => {
		if (!keys && cache)
			keys = (await cache.keys()).map(a => a.url.slice(9));
	};

	const saveKeys = async (key: string) => {
		if (keys?.indexOf(key) === -1) {
			keys.push(key);
		}
	};

	const removeCache = async (key: string) => {
		await cache?.delete(prefix + key);
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
		get: getData,
		async put(key: string, resp: Response) {
			if (!browser) return;
			if (!cache) await openCache()
			if (cache) {
				await saveKeys(key);
				await cache.put(prefix+key, resp);
			}
		}
	};
})();
