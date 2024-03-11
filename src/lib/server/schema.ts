import { dbCli, kvCli } from '$lib/server/setup';
import { tables } from './tables';

const schema: string[] = [];
const version = '0.0';
let curVersion = '';
export const execSchema = async () => {
	if (curVersion === version || (await kvCli.get('ver')) === version) return;
	await kvCli.set('ver', (curVersion = version));
	await Promise.all(schema.map((a) => dbCli.run(a)));
};

const table = (name: keyof typeof tables) => {
	const cfg = tables[name];
	const f = Object.entries(cfg)
		.map(([k, v]) => `${k} ${v}`)
		.join();
	const err = (opt: string, msg: string) => Error(`[${opt}] Table ${name}: ${msg}`);
	schema.push(`CREATE TABLE IF NOT EXISTS ${name} (${f})`);
	return {
		insert: (columns: (keyof typeof cfg)[], ...values: unknown[][]) => {
			let fields: unknown[] = [];
			const s: string[] = [];
			values.forEach((a) => {
				const l = a.length;
				if (l) {
					fields = fields.concat(a);
					s.push(`(?${',?'.repeat(l - 1)})`);
				}
			});
			const sql = `INSERT INTO ${name} (${columns.join()}) VALUES ${s.join()}`;
			return dbCli.run(sql, ...fields);
		},

		first: (conditions: string, ...values: []) => {
			return dbCli.first(`SELECT * FROM ${name} ${conditions}`, ...values);
		},

		all: (conditions = '', ...values: []) => {
			return dbCli.all(`SELECT * FROM ${name} ${conditions}`, ...values);
		},

		update: (obj: { [key in keyof typeof cfg]: unknown }, conditions: string, ...fields: []) => {
			const values: unknown[] = [];
			const keys: string[] = [];
			for (const [k, v] of Object.entries(obj)) {
				keys.push(`${k}=?`);
				values.push(v);
			}
			return dbCli.run(`UPDATE ${name} SET ${keys.join(' ')} ${conditions}`, ...values, ...fields);
		},

		delete: (conditions: string, ...values: []) => {
			if (!conditions) throw err('delete', 'no conditions');
			return dbCli.run(`DELETE FROM ${name} ${conditions}`, ...values);
		}
	};
};

export const Customers = table('Customers');
