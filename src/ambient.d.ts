import { D1Database, R2Bucket, KVNamespace } from '@cloudflare/workers-types';

type CacheConfig = { expire?: number; key?: string | (() => string) };
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

type ApiFunction<T> = (params: { data?: T; headers: Headers }) => unknown;

type APIHandler = {
	POST?: ApiFunction<ArrayBuffer | undefined>;
	PUT?: ApiFunction<ArrayBuffer | undefined>;
	PATCH?: ApiFunction<ArrayBuffer | undefined>;
	GET?: ApiFunction<string | undefined>;
	DELETE?: ApiFunction<string | undefined>;
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
	get: (
		key: string,
		type?: 'string' | 'arrayBuffer' | 'stream'
	) => Promise<string | ArrayBuffer | null>;
	set: (key: string, value: string | ArrayBuffer, expire? = 0) => Promise<void>;
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
	put: (
		data: ReadableStream<Uint8Array> | ArrayBuffer | Blob | File,
		name?: string | null,
		type?: string | null
	) => Promise<string | undefined>;
	del: (key: string) => Promise<undefined>;
	list: () => Promise<FileMeta[]>;
};

type FetchResult = {
	pending: number;
	data: unknown;
	error: unknown;
};
