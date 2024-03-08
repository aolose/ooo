import {error} from "@sveltejs/kit";
import {getObj} from "$lib/server/r2";

import type {RequestHandler} from './$types';

export const GET: RequestHandler = async ({params}) => {
    const id = params.id
    const res = id && await getObj(id)
    if (!res) throw error(404)
    return res
}