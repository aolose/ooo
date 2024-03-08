import {bufHash} from "$lib/server/utils";
import type {R2Bucket} from "@cloudflare/workers-types";

export const R2:{bucket?:R2Bucket}={}
export  const getObj = async(key:string)=> {
    if(! R2.bucket)return
    const object = await R2.bucket.get(key);
    console.log({object})
    if (object === null) {
        return;
    }
    const headers = new Headers();
    headers.set('etag', object.httpEtag);
    return new Response(object.body as ReadableStream, {
        headers,
    });
}

export const putObj = async (file:File)=> {
    if(!R2.bucket)return 
    const buf = await file.arrayBuffer()
    const key = await bufHash(buf)
    await R2.bucket.put(key, buf);
    setTimeout(delObj,5e3,key)
    await listObj()
    return key
}

export const listObj = async ()=> {
    if(!R2.bucket)return
    const ls = await R2.bucket.list()
    console.log(ls.objects)
}

export const delObj = async (key:string)=> {
    if(!R2.bucket)return
    console.log('del delObj: ',key)
   await R2.bucket.delete(key)
}

export const initR2 = async (bucket?:R2Bucket) => {
    if (R2.bucket||!bucket) return
    R2.bucket=bucket
}