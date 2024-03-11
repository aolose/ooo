import { type D1Database, D1PreparedStatement } from '@cloudflare/workers-types';
import { pick } from '$lib/server/utils';

let d1: D1Database | null = null;
export const setD1 = (db: D1Database | undefined) => {
	if (!db || d1) return;
	d1 = db;
	console.log('Cloudflare D1 connected!');
};
const sqlBuilder =
	(fn: (d: D1PreparedStatement) => unknown) =>
	<T>(raw: TemplateStringsArray | string, ...field: unknown[]) => {
		if (!d1) throw new Error('cloudflare D1 not configure.');
		const sql = typeof raw === 'string' ? raw : raw.join('?');
		const p = d1.prepare(sql);
		if (field.length) return fn(p.bind(...field)) as Promise<T>;
		return fn(p) as Promise<T>;
	};

const pickResult =
	<T>(...keys: (keyof T)[]) =>
	(r: T) => {
		return pick(r, ...keys);
	};
export const run = sqlBuilder((p: D1PreparedStatement) => {
	return p.run().then(pickResult('success', 'error'));
});
export const first = sqlBuilder((p: D1PreparedStatement) => {
	return p.first();
});
export const all = sqlBuilder((p: D1PreparedStatement) => {
	return p.all().then(pickResult('error', 'results'));
});
