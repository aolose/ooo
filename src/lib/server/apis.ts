import type { RequestEvent } from '@sveltejs/kit';
import { bukCli, dbCli } from '$lib/server/setup';
import { Customers } from '$lib/server/schema';
import type { APIRoute } from '../../ambient';
import { tableStr } from '$lib/server/utils';

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
			return await dbCli.all`select * from Customers`;
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
			} else return tableStr(r.results, keys);
		}
	}
};
