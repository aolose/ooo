import type { BucketClient, DBClient, PlatformEnv } from '../../../../ambient';
import { dev } from '$app/environment';
import { useLocal } from '$lib/server/adapter/cloudflare/dev';
import { all, first, run, setD1 } from '$lib/server/adapter/cloudflare/d1';
import { delObj, getObj, setR2, listObj, putObj } from '$lib/server/adapter/cloudflare/r2';

export default (bukCli: BucketClient, dbCli: DBClient) => {
	console.log('use cloudflare.');
	Object.assign(bukCli, {
		init: setR2,
		get: getObj,
		del: delObj,
		put: putObj,
		list: listObj
	});
	Object.assign(dbCli, {
		run: run,
		first: first,
		all: all
	});
	let done = 0;
	return async (env = {} as PlatformEnv, ...tasks: (() => void)[]) => {
		if (done) return;
		done = 1;
		if (dev) await useLocal();
		else {
			setR2(env?.MY_BUCKET);
			setD1(env?.D1);
		}
		if (tasks) tasks.forEach((f) => f());
	};
};
