import type { RequestEvent } from '@sveltejs/kit';
import { bukCli, kvCli } from '$lib/server/setup';
import { Customers } from '$lib/server/schema';
import type { APIRoute } from '../../ambient';
import { flatObj } from '$lib/server/utils';
import { parseArray } from '$lib/utils';

export const Apis: APIRoute = {
	test: {
		GET() {
			return 'hello world';
		}
	},
	files: {
		DELETE(e: RequestEvent) {
			const key = e.url.search.slice(1);
			if (key) return bukCli.del(key);
		},
		GET() {
			return bukCli.list();
		},
		async POST(event: RequestEvent) {
			const form = await event.request.formData();
			const file = form.get('file') as File;
			if (file) return bukCli.put(file);
		}
	},
	users: {
		async GET() {
			return await Customers.all();
		}
	},
	user: {
		async DELETE() {
			return Customers.delete(' ');
		},
		async PUT() {
			const gen = () => [
				Math.random().toString(36).slice(6),
				Math.random().toString(36).slice(6),
				Math.random().toString(36).slice(6)
			];
			return Customers.insert(
				['CustomerName', 'CompanyName', 'ContactName'],
				gen(),
				gen(),
				gen(),
				gen()
			);
		},
		async GET(e) {
			const keys = e.url.search.slice(1).split(',');
			const r = await Customers.all();
			if (r.error) {
				// todo
			} else return flatObj(r.results, keys);
		}
	},
	kv: {
		async GET() {
			const ls = await kvCli.list();
			return ls;
		},
		DELETE({ url }) {
			const k = url.search.slice(1);
			return kvCli.del(k);
		},
		async POST({ request }) {
			const [k, v] = parseArray<[string, string]>(new Uint8Array(await request.arrayBuffer()));
			if (k && v) await kvCli.set(k, v);
		}
	}
};
