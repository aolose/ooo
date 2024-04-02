import type { Handle } from '@sveltejs/kit';
import { apiHandler } from '$lib/server/apiHandler';
import { filter } from '$lib/server/firewall';
import { connect } from '$lib/server/setup';
import { execSchema } from '$lib/server/schema';
import { Apis } from '$lib/server/apis';
import { handleUpgrade } from 'vite-sveltekit-cf-ws';

let once = 0;
const initSockets = () => {
	once++
	handleUpgrade((req, createWs) => {
		const pathname = new URL(req.url || '', 'ws://base.url').pathname;
		const fn = Apis[pathname.slice(5)]?.WS;
		if (fn) {
			fn(createWs());
		}
	});
};

export const handle: Handle = async ({ event, resolve }) => {
	if (!once) initSockets();
	await connect(event.platform?.env, execSchema);
	if (event.url.pathname.startsWith('/api/')) {
		return apiHandler(event);
	}
	const res = filter(event);
	if (res) return res;
	return resolve(event);
};
