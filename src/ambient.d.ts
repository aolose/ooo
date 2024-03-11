import { HttpMethod, RequestEvent } from '@sveltejs/kit';
import { D1Database, R2Bucket, KVNamespace, ReadableStream } from '@cloudflare/workers-types';

type KVItem = string | ArrayBuffer | ArrayBufferView | ReadableStream;
type sqlTemplateTag = <T>(
	raw: TemplateStringsArray | string,
	...field: unknown[]
) => T | Promise<T>;
type Bucket = R2Bucket;
type Database = D1Database;
type KV = KVNamespace;
type FileMeta = {
	key: string;
	name: string;
	size: number;
	type: string;
	updated: number;
};

type ApiFunction = (
	params: RequestEvent<Partial<Record<string, string>>, string | null>
) => unknown;

type APIHandler = {
	[key in HttpMethod]?: ApiFunction;
};

type APIRoute = {
	[key: string]: APIHandler;
};

type PlatformEnv = {
	COUNTER: DurableObjectNamespace;
	D1: Database;
	KV: KV;
	MY_BUCKET: Bucket;
};

type KVClient = {
	get: (key: string) => Promise<string | null>;
	set: (key: string, value: KVItem, expire? = 0) => Promise<void>;
	del: (key: string) => Promise<void>;
	list: () => Promise<[string, string | null][]>;
};

type DBClient = {
	run: sqlTemplateTag<{ success: unknown; error: unknown }>;
	first: sqlTemplateTag;
	all: sqlTemplateTag<{ result: unknown; error: unknown }>;
};

type BucketClient = {
	get: (key: string) => Promise<Response>;
	put: (file: File) => Promise<string | undefined>;
	del: (key: string) => Promise<undefined>;
	list: () => Promise<FileMeta[]>;
};

type FetchResult = {
	pending: number;
	data: unknown;
	error: unknown;
};
