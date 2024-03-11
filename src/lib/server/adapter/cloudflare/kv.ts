import type { KVNamespace, KVNamespacePutOptions } from '@cloudflare/workers-types';
import type { KVItem } from '../../../../ambient';

let kv: null | KVNamespace = null;

export const setKV = (k: KVNamespace) => {
	kv = k;
};
const err = Error('KV not set');
export const set = async (k: string, v: KVItem, expireMinutes = 0) => {
	if (!kv) throw err;
	let o: KVNamespacePutOptions | undefined;
	if (expireMinutes) o = { expiration: Math.floor(Date.now() / 1000) + expireMinutes * 60 };
	await kv.put(k, v, o);
};

export const del = async (k: string) => {
	if (!kv) throw err;
	await kv.delete(k);
};
export const get = (key: string) => {
	if (!kv) throw err;
	return kv.get(key);
};
export const list = async (key: string) => {
	if (!kv) throw err;
	const ks = (await kv.list()).keys;
	let d = [] as [string, string | null][];
	for (const o of ks) d.push([o.name, await kv.get(o.name)]);
	return d;
};
