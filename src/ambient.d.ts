import { HttpMethod, RequestEvent } from '@sveltejs/kit';
import {D1Database, R2Bucket} from "@cloudflare/workers-types";

type ApiFunction = (
	params: RequestEvent<Partial<Record<string, string>>, string | null>
) => PromiseLike<BodyInit | null | undefined>|BodyInit | null | undefined;

type APIHandler = {
	[key: HttpMethod]: ApiFunction;
};

type APIRoute = {
	[key: sting]: APIHandler;
};

type SignedRecord = {
	url:string,
	exp:number
}

type PlatformEnv={
	COUNTER: DurableObjectNamespace;
	D1: D1Database;
	MY_BUCKET:R2Bucket
}
type R2Client ={
	get:(key:string)=>Promise<void>
	put:(file:File)=>Promise<R2Object|null>
	del:(key:string)=>Promise<void>
}