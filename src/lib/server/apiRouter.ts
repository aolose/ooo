import type {RequestEvent} from "@sveltejs/kit";
import {Apis} from "$lib/server/apis";
import type {ApiFunction} from "../../ambient";

export const apiHandler = async (event:RequestEvent) => {
    const path = event.url.pathname.substring(5) as keyof typeof Apis
    const api: ApiFunction = Apis[path]?.[event.request.method]
    if (!api) return new Response('',{status:404})
    const res = await api(event)
    if (res instanceof Response) return res;
    return new Response(res)
}