import type { StorageConnector } from '../../../../ambient';
import { delObj, getObj, initR2, listObj, putObj } from '$lib/server/adapter/cloudflare/r2';
import { dev } from '$app/environment';
import { useLocal } from '$lib/server/adapter/cloudflare/dev';

export default (connector: StorageConnector) => {
	console.log('use cloudflare.');
	connector.bucket = {
		init: initR2,
		get: getObj,
		del: delObj,
		put: putObj,
		list: listObj
	};
	connector.init = async (env) => {
		if (dev) await useLocal();
		else {
			initR2(env?.MY_BUCKET);
		}
	};
};
