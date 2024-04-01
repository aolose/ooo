import type { Handle } from '@sveltejs/kit';
import { apiHandler } from '$lib/server/apiHandler';
import { filter } from '$lib/server/firewall';
import { connect } from '$lib/server/setup';
import { execSchema } from '$lib/server/schema';
import {Apis, devLog} from "$lib/server/apis";
import {bind, watchLog} from "vite-sveltekit-cf-ws";


let once = 0
const initSockets = ()=>{
	devLog(3,'init sockets')
	watchLog((s)=>devLog(0,s))
	Object.entries(Apis).forEach(([path,m])=>{
		if(m.WS){
			devLog(3,`bind ws: ${'/api/'+path}`)
			bind('/api/'+path,m.WS)
		}
	})
}

export const handle: Handle = async ({ event, resolve }) => {
	if(!once++)initSockets()
	await connect(event.platform?.env, execSchema);
	if (event.url.pathname.startsWith('/api/')) {
		return apiHandler(event);
	}
	const res = filter(event);
	if (res) return res;
	return resolve(event);
};
