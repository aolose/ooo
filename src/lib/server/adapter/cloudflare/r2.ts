import {bufHash} from '$lib/server/utils';
import type {R2Bucket} from '@cloudflare/workers-types';
import type {FileMeta} from '../../../../ambient';

let r2: R2Bucket | null = null;

const err = Error('cloudflare bucket not configure!')
export const getObj = async (key: string) => {
    if (!r2) throw err;
    const object = await r2.get(key);
    if (object === null) {
        return new Response('', {status: 404});
    }
    const headers = new Headers();
    headers.set('etag', object.httpEtag);
    const {type, name} = object.customMetadata || {};
    const {cacheControl, contentEncoding, cacheExpiry, contentType, contentLanguage} =
    object.httpMetadata || {};
    if (cacheControl) headers.set('content-control', cacheControl);
    if (contentEncoding) headers.set('content-encoding', contentEncoding);
    if (cacheExpiry) headers.set('expires', cacheExpiry.toString());
    if (contentLanguage) headers.set('content-language', contentLanguage);
    if (contentType) headers.set('content-type', contentType);
    else if (type) headers.set('content-type', type);
    if (name) headers.set('content-disposition', `inline; filename="${encodeURI(name)}"`);
    return new Response(object.body as BodyInit, {
        headers
    });
};

export const putObj = async (file: File) => {
    if (!r2) throw err;
    const name = file.name;
    const type = file.type;
    const key = await bufHash(await file.arrayBuffer());
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await r2.put(key, file, {
        customMetadata: {
            name,
            type
        }
    });
    return key;
};

export const listObj = async () => {
    if (!r2) throw err;
    const opt: R2ListOptions = {
        limit: 100,
        include: ['customMetadata']
    };
    const ls = await r2.list(opt);
    return ls.objects.map((a) => {
        const m = a.customMetadata || {};
        return {...m, key: a.key, size: a.size, updated: a.uploaded.getTime()} as FileMeta;
    });
};

export const delObj = async (key: string) => {
    if (!r2) throw err;
    console.log('del delObj: ', key);
    await r2.delete(key);
};

export const setR2 = (bucket?: R2Bucket) => {
    if (r2 || !bucket) return;
    r2 = bucket;
    console.log('Cloudflare R2 connected!');
};
