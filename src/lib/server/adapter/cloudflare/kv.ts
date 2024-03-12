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

export const set = async (k: string, v: string, expireMinutes = 0) => {
	if (!kv) throw err;
	let o: KVNamespacePutOptions | undefined;
	if (expireMinutes) o = { expiration: Math.floor(Date.now() / 1000) + expireMinutes * 60 };
	await kv.put(k, v, o);
	delCache.delete(k);
	localCache.set(k, [v, Date.now() + expireMinutes * 6e4]);
};

export const del = async (k: string) => {
	if (!kv) throw err;
	await kv.delete(k);
	delCache.add(k);
	localCache.delete(k);
};
export const get = (key: string) => {
	if (!kv) throw err;
	const r = localCache.get(key);
	if (r) {
		if (Date.now() < r[1]) return r[0];
		else localCache.delete(key);
		return null;
	}
	return kv.get(key);
};
export const list = async () => {
	if (!kv) throw err;
	const d = [] as [string, string | null][];
	const ks = new Set((await kv.list()).keys.map((a) => a.name));
	for (const o of delCache) ks.delete(o);
	for (const [k] of localCache) ks.add(k);
	const kk = [...ks].sort();
	for (const o of kk) {
		const v = localCache.get(o);
		if (v && Date.now() > v[1]) d.push([o, v[0]]);
		else d.push([o, await kv.get(o)]);
	}
	return d;
};
