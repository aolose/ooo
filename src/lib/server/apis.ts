import { error } from '@sveltejs/kit';
import { bukCli, kvCli } from '$lib/server/setup';
import { Customers } from '$lib/server/schema';
import type { APIRoute } from '../../ambient';
import { flatObj } from '$lib/server/utils';
import { parseArray } from '$lib/utils';
import mime from 'mime';
import { ecdh } from '$lib/crypto';

let logs = [] as string[];
export const devLog = (...data: unknown[]) => {
	if (/api\/log/.test(`${data}`)) return;
	logs.push(`${new Date().toTimeString()} ${data.join(' ')}`);
	const len = logs.length;
	const max = 100;
	if (len > max) logs = logs.slice(len - max);
};

export const Apis: APIRoute = {
	log: {
		GET() {
			const s = logs.slice();
			logs.length = 0;
			return s;
		}
	},
	hello: {
		async POST({ data }) {
			if (data) return await ecdh.init(data);
		},
		async WS(serv) {
			serv.accept();
			serv.addEventListener('error', function (e) {
				devLog('error', e);
				serv.send(e.toString());
			});
			serv.addEventListener('close', function (e) {
				devLog('close', e);
				serv.send(e.reason);
			});
			serv.addEventListener('message', function (e) {
				devLog('message', e);
				serv.send('echo:' + e.data);
			});
		}
	},
	echo: {
		GET({ data }) {
			return data;
		},
		POST({ data }) {
			return data;
		}
	},
	files: {
		DELETE({ data }) {
			if (data) return bukCli.del(data);
		},
		GET() {
			return bukCli.list();
		},
		async POST({ data, headers }) {
			if (!data) throw error(500, 'empty file');
			let type = headers.get('x-file-type');
			const name = headers.get('x-file-name');
			if (!type && name) {
				const ext = name.slice(name.lastIndexOf('.'));
				if (ext) type = mime.getType(ext);
			}
			return bukCli.put(data, name, type);
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
		async GET({ data }) {
			if (!data) return;
			const keys = data.split(',');
			const r = await Customers.all();
			if (r.error) {
				// todo
			} else return flatObj(r.results, keys);
		}
	},
	kv: {
		async GET() {
			return await kvCli.list();
		},
		DELETE({ data }) {
			if (data) return kvCli.del(data);
		},
		async POST({ data }) {
			if (!data) return;
			const [k, v] = parseArray<[string, string]>(new Uint8Array(data));
			if (k && v) await kvCli.set(k, v);
		}
	}
};
