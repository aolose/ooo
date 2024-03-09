import {error} from "@sveltejs/kit";

import type {RequestHandler} from './$types';
import {storage} from "$lib/server/storage";

export const GET: RequestHandler = async ({params, url}) => {
    const id = params.id
    if (!id) throw error(404, 'file not found')
    if (!storage.bucket) throw error(500, 'bucket unset')
    const res = await storage.bucket.get(id)
    const download = url.searchParams.get('d')
    if (download) {
        const headers = res.headers
        const v = headers.get('content-disposition')
        if (v) headers.set('content-disposition', v.replace('inline', 'attachment'))
    }
    return res
}
