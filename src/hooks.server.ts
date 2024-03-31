import type { Handle } from '@sveltejs/kit';
import { apiHandler } from '$lib/server/apiHandler';
import { filter } from '$lib/server/firewall';
import { connect } from '$lib/server/setup';
import { execSchema } from '$lib/server/schema';
import {Apis} from "$lib/server/apis";
import {bind} from "vite-cloudflare-sveltekit-ws";


const initSockets = ()=>{
	console.log('init sockets')
	Object.entries(Apis).forEach(([path,m])=>{
		if(m.WS){
			bind('/api/'+path,m.WS)
		}
	})
}

export const handle: Handle = async ({ event, resolve }) => {
	await connect(event.platform?.env,
		execSchema,initSockets
	);
	if (event.url.pathname.startsWith('/api/')) {
		return apiHandler(event);
	}
	const res = filter(event);
	if (res) return res;
	return resolve(event);
};
