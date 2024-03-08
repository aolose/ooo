import type {Handle} from "@sveltejs/kit";
import {apiHandler} from "$lib/server/apiRouter";
import {filter} from "$lib/server/firewall";
import {dev} from "$app/environment";
import type {Miniflare} from "miniflare";
import {initR2} from "$lib/server/r2";

let mf: Miniflare;
export const handle: Handle = async ({event, resolve}) => {
    if (dev) {
        if (!mf) {
            const {Miniflare, Log, LogLevel} = await import("miniflare");
            mf = new Miniflare({
                log: new Log(LogLevel.INFO),
                // kvPersist: "./kv-data",
                // kvNamespaces: ["KV"],
                // d1Persist: "./d1-data",
                // d1Databases: ["D1"],
                r2Buckets: ["ooo"],
                // you should also be able to add durable objects & r2
                script: "",
                modules: true,
            });
        }
      
        event.platform = {
            env: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                MY_BUCKET: await mf.getR2Bucket('ooo')
            }
        };
    }
    await initR2(event.platform?.env.MY_BUCKET)
    if (event.url.pathname.startsWith('/api/')) {
        return apiHandler(event)
    }
    const res = filter(event)
    if (res) return res
    return resolve(event);
}