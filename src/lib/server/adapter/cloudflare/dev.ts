import type { Miniflare } from 'miniflare';
import { setR2 } from '$lib/server/adapter/cloudflare/r2';
import { BUCKET_NAME, DB_NAME, KV_NAME } from '$env/static/private';
import { setD1 } from '$lib/server/adapter/cloudflare/d1';
import { setKV } from '$lib/server/adapter/cloudflare/kv';

let mf: Miniflare;

/**
 * For Cloudflare Local Development
 *
 * Miniflare is a simulator for developing and
 * testing Cloudflare Workers. It's written in
 * TypeScript, and runs your code in a sandbox
 * implementing Workers' runtime APIs.
 * ref: https://miniflare.dev/
 */
export async function useLocal() {
	if (!mf) {
		const { Miniflare, Log, LogLevel } = await import('miniflare');
		mf = new Miniflare({
			log: new Log(LogLevel.INFO),
			// kvPersist: "./kv-data",
			kvNamespaces: [KV_NAME],
			// d1Persist: "./d1-data",
			d1Databases: [DB_NAME],
			r2Buckets: [BUCKET_NAME],
			// you should also be able to add durable objects & r2
			script: '',
			modules: true
		});
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		setKV(await mf.getKVNamespace(KV_NAME));
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		setR2(await mf.getR2Bucket(BUCKET_NAME));
		setD1(await mf.getD1Database(DB_NAME));
	}
}
