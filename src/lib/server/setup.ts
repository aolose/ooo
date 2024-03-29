import type { BucketClient, DBClient, KVClient } from '../../ambient';
import cloudflareConnector from './adapter/cloudflare';
import { kv } from '$lib/fix';

export const bukCli = {} as BucketClient;
export const dbCli = {} as DBClient;
export const kvCli = kv as KVClient;
export const connect = cloudflareConnector(kvCli, bukCli, dbCli);
