import { bufHash } from '$lib/server/utils';
import type { R2Bucket } from '@cloudflare/workers-types';
import type { FileMeta } from '../../../../ambient';
import { error } from '@sveltejs/kit';

export const R2: { bucket?: R2Bucket } = {};
export const getObj = async (key: string) => {
	if (!R2.bucket) return error(500, 'cloudflare bucket not connect!');
	const object = await R2.bucket.get(key);
	if (object === null) {
		return new Response('', { status: 404 });
	}
	const headers = new Headers();
	headers.set('etag', object.httpEtag);
	const { type, name } = object.customMetadata || {};
	const { cacheControl, contentEncoding, cacheExpiry, contentType, contentLanguage } =
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
	if (!R2.bucket) return;
	const name = file.name;
	const size = file.size.toString(36);
	const type = file.type;
	const key = await bufHash(await file.arrayBuffer());
	console.log(name, size, type);
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	await R2.bucket.put(key, file, {
		customMetadata: {
			name,
			size,
			type
		}
	});
	return key;
};

export const listObj = async () => {
	if (!R2.bucket) return [];
	const opt: R2ListOptions = {
		limit: 100,
		include: ['customMetadata']
	};
	const ls = await R2.bucket.list(opt);
	return ls.objects.map((a) => {
		const m = a.customMetadata || {};
		return { ...m, key: a.key } as FileMeta;
	});
};

export const delObj = async (key: string) => {
	if (!R2.bucket) return;
	console.log('del delObj: ', key);
	await R2.bucket.delete(key);
};

export const initR2 = (bucket?: R2Bucket) => {
	if (R2.bucket || !bucket) return;
	R2.bucket = bucket;
	console.log('Cloudflare R2 connected!');
};
