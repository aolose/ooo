import type { KVNamespace, KVNamespacePutOptions } from '@cloudflare/workers-types';

let kv: null | KVNamespace = null;
const err = Error('KV not set');

export const setKV = (k: KVNamespace) => {
	kv = k;
};

export const set = async (k: string, v: string, expireMinutes = 0) => {
	if (!kv) throw err;
	let o: KVNamespacePutOptions | undefined;
	if (expireMinutes) o = { expiration: Math.floor(Date.now() / 1000) + expireMinutes * 60 };
	await kv.put(k, v, o);
};

export const del = async (k: string) => {
	if (!kv) throw err;
	await kv.delete(k);
};

export const get = async (key: string, type?: 'text' | 'stream' | 'arrayBuffer') => {
	if (!kv) throw err;
	if (type) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		return await kv.get(key, { type: type });
	}
	return await kv.get(key);
};

export const list = async () => {
	if (!kv) throw err;
	const d = [] as [string, string | null][];
	const ks = new Set((await kv.list()).keys.map((a) => a.name));
	const kk = [...ks].sort();
	for (const o of kk) {
		d.push([o, await get(o)]);
	}
	return d;
};
