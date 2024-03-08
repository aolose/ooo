import type {RequestEvent} from "@sveltejs/kit";

export const filter = (event:RequestEvent):Response|undefined=>{
    console.log(event.url.pathname)
    return
}