import type {Handle} from "@sveltejs/kit";
import {apiHandler} from "$lib/server/apiRouter";
import {filter} from "$lib/server/firewall";

import {storage} from "$lib/server/storage";

export const handle: Handle = async ({event, resolve}) => {
    storage.init(event.platform?.env)
    if (event.url.pathname.startsWith('/api/')) {
        return apiHandler(event)
    }
    const res = filter(event)
    if (res) return res
    return resolve(event);
}
