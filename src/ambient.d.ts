import { HttpMethod, RequestEvent } from '@sveltejs/kit';
import { D1Database, R2Bucket } from '@cloudflare/workers-types';

type sqlTemplateTag = <T>(raw: TemplateStringsArray, ...field: unknown[]) => T | Promise<T>;
type MyBucket = R2Bucket;
type MyDatabase = D1Database;
type FileMeta = {
	key: string;
	name: string;
	size: number;
	type: string;
	updated: number;
};

type ApiFunction = (
	params: RequestEvent<Partial<Record<string, string>>, string | null>
) => PromiseLike<BodyInit | null | undefined> | BodyInit | null | undefined;

type APIHandler = {
	[key: HttpMethod]: ApiFunction;
};

type APIRoute = {
	[key: sting]: APIHandler;
};

type PlatformEnv = {
	COUNTER: DurableObjectNamespace;
	D1: MyDatabase;
	MY_BUCKET: MyBucket;
};
type DB = {
	run: sqlTemplateTag;
	first: sqlTemplateTag;
	all: sqlTemplateTag;
};

type BucketManager = {
	init: (client: MyBucket) => void;
	get: (key: string) => Promise<Response>;
	put: (file: File) => Promise<string | undefined>;
	del: (key: string) => Promise<unknown>;
	list: () => Promise<FileMeta[]>;
};

type StorageConnector = {
	connect: (callback) => void;
	db: DB;
	bucket?: BucketManager;
	init: (env?: PlatformEnv) => void;
};

type FetchResult = {
	pending: number;
	data: unknown;
	error: unknown;
};
