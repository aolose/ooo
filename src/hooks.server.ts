import type { Handle } from '@sveltejs/kit';
import { apiHandler } from '$lib/server/apiHandler';
import { filter } from '$lib/server/firewall';
import { connect } from '$lib/server/setup';
import { execSchema } from '$lib/server/schema';
import {Apis, devLog} from "$lib/server/apis";
import {bind, watchLog} from "vite-sveltekit-cf-ws";


const initSockets = ()=>{
	console.log('init sockets')
	watchLog((s:string)=>devLog(0,s))
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
