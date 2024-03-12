import type { KVNamespace, KVNamespacePutOptions } from '@cloudflare/workers-types';

let kv: null | KVNamespace = null;

// when put or delete kv, the changes can't immediately appear in result of 'get' or 'list'.
// the localCache and delCache if design for you query after your kv update.
const localCache = new Map<string, [string, number]>();
const delCache = new Set<string>();
const err = Error('KV not set');

export const setKV = (k: KVNamespace) => {
	kv = k;
};

export const set = (k: string, v: string, expireMinutes = 0) => {
	if (!kv) throw err;
	delCache.delete(k);
	localCache.set(k, [v, expireMinutes ? Date.now() + expireMinutes * 6e4 : 0]);
	let o: KVNamespacePutOptions | undefined;
	if (expireMinutes) o = { expiration: Math.floor(Date.now() / 1000) + expireMinutes * 60 };
	// todo: if error happened
	kv.put(k, v, o);
};

export const del = (k: string) => {
	if (!kv) throw err;
	delCache.add(k);
	localCache.delete(k);
	// todo: if error happened
	kv.delete(k);
};
export const get = async (key: string) => {
	if (!kv) throw err;
	const r = localCache.get(key);
	if (r) {
		if (!r[1] || Date.now() < r[1]) return r[0];
		else {
			del(key);
		}
		return null;
	}
	return await kv.get(key);
};
export const list = async () => {
	if (!kv) throw err;
	const d = [] as [string, string | null][];
	const ks = new Set((await kv.list()).keys.map((a) => a.name));
	for (const o of delCache) ks.delete(o);
	for (const [k] of localCache) ks.add(k);
	const kk = [...ks].sort();
	for (const o of kk) {
		d.push([o, await get(o)]);
	}
	return d;
};
